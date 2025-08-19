export const passwordResetTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the link below to set a new password:</p>
    <a href="{{resetUrl}}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
        Reset Password
    </a>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p>{{resetUrl}}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
`;
