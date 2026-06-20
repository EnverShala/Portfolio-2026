<?php

// --- Rate limiting (file-based, no DB required) ---
$rateLimit  = 3;    // max requests
$rateWindow = 600;  // per 10 minutes (seconds)
$ip         = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$cacheFile  = sys_get_temp_dir() . '/rl_' . md5($ip) . '.json';

function checkRateLimit(string $file, int $limit, int $window): bool {
    $now  = time();
    $data = ['count' => 0, 'reset' => $now + $window];

    if (file_exists($file)) {
        $raw = file_get_contents($file);
        if ($raw !== false) {
            $stored = json_decode($raw, true);
            if (is_array($stored) && isset($stored['reset'], $stored['count']) && $stored['reset'] > $now) {
                $data = $stored;
            }
        }
    }

    if ($data['count'] >= $limit) {
        return false;
    }

    $data['count']++;
    file_put_contents($file, json_encode($data), LOCK_EX);
    return true;
}

// --- CORS: restrict to own domain ---
$allowedOrigins = ['https://vizionists.com', 'https://www.vizionists.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'OPTIONS':
        header('Access-Control-Allow-Methods: POST');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 86400');
        exit;

    case 'POST':
        header('Content-Type: application/json; charset=utf-8');

        // Rate limit check
        if (!checkRateLimit($cacheFile, $rateLimit, $rateWindow)) {
            http_response_code(429);
            echo json_encode(['error' => 'Too many requests. Please try again later.']);
            exit;
        }

        // Validate Content-Type
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'application/json') === false) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request.']);
            exit;
        }

        // Parse JSON body
        $raw    = file_get_contents('php://input');
        $params = json_decode($raw, true);

        if (!is_array($params)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request.']);
            exit;
        }

        $name    = trim($params['name']    ?? '');
        $email   = trim($params['email']   ?? '');
        $message = trim($params['message'] ?? '');

        // Required fields
        if ($name === '' || $email === '' || $message === '') {
            http_response_code(400);
            echo json_encode(['error' => 'All fields are required.']);
            exit;
        }

        // Length limits
        if (strlen($name) > 100) {
            http_response_code(400);
            echo json_encode(['error' => 'Name must be 100 characters or fewer.']);
            exit;
        }
        if (strlen($email) > 254) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address.']);
            exit;
        }
        if (strlen($message) > 5000) {
            http_response_code(400);
            echo json_encode(['error' => 'Message must be 5000 characters or fewer.']);
            exit;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address.']);
            exit;
        }

        // Strip CR/LF/null from all header-bound values (header injection prevention)
        $name  = str_replace(["\r", "\n", "\0"], '', $name);
        $email = str_replace(["\r", "\n", "\0"], '', $email);

        // Build plain-text email body (no HTML, so no XSS risk in mail client)
        $recipient = 'envershala1989@gmail.com';
        $subject   = 'Portfolio Contact from ' . $name;
        $body      = "Name:    " . $name . "\r\n"
                   . "Email:   " . $email . "\r\n\r\n"
                   . "Message:\r\n" . $message;

        // Use site address in From; put sender in Reply-To so replies go to them
        $headers   = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: text/plain; charset=utf-8';
        $headers[] = 'From: portfolio-no-reply@vizionists.com';
        $headers[] = 'Reply-To: ' . $email;

        $sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

        if ($sent) {
            http_response_code(200);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send message. Please try again.']);
        }
        break;

    default:
        header('Allow: POST', true, 405);
        echo json_encode(['error' => 'Method not allowed.']);
        exit;
}
