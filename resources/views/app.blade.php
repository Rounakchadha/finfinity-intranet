<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'FinFinity Portal') }}</title>
    @vite(['resources/js/main.jsx', 'resources/css/globals.css'])
</head>
<body>
    <div id="root"></div>
</body>
</html>
