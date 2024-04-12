package main

const adminContentApproval = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Approval Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Approval Request</h1>
        </div>
        <p>Hi,</p>
        <p>A professor has requested approval for the following content:</p>
        <p><strong>CreatedBy:</strong> {{ .CreatedBy }}</p>
		<p><strong>Department:</strong> {{ .Department }}</p>
		<p><strong>Semester:</strong> {{ .Semester }}</p>
		<p><strong>Content Code:</strong> {{ .CourseCode }}</p>
        <p><strong>Content Name:</strong> {{ .Name }}</p>
        <p><strong>Content Description:</strong> {{ .Description }}</p>
        <p>Please review the content and take appropriate action:</p>
        <p><a href="{{ .ApprovalURL }}" class="button">Approve / Reject</a></p>
        <p>If you have any questions or concerns, please contact us at admin@alph-a.com.</p>
        <p>Thank you!</p>
    </div>
</body>
</html>
`

const professorContentApproval = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Approval</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Content Approval</h1>
        </div>
        <p>Hi {{ .CreatedBy }},</p>
        <p><strong>Your content "{{ .Name }}" has been {{ .Status }} by the admin.</strong></p>
        <p>If you have any questions or concerns, please contact us at admin@alph-a.com.</p>
        <p>Thank you!</p>
    </div>
</body>
</html>
`