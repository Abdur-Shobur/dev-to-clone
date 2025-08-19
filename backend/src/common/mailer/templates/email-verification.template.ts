export const emailVerificationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
</head>
<body>
    <h2>Welcome to Dev.to Clone!</h2>
    <p>Please click the link below to verify your email address:</p>
    <a href="{{verificationUrl}}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
        Verify Email
    </a>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p>{{verificationUrl}}</p>
    <p>This link will expire in 24 hours.</p>
</body>
</html>
`;
