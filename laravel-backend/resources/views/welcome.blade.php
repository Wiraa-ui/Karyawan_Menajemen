<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Halaman Utama</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
    <div class="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 class="text-3xl font-bold mb-4">{{ $message }}</h1>
        <p class="text-lg">
            Endpoint API root di: 
            <a href="{{ $api_root }}" class="text-blue-500 hover:underline">{{ $api_root }}</a>
        </p>
    </div>
</body>
</html>
