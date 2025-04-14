export const minimalTemplate = (product: {
  title: string;
  description: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  basePrice: number;
  commissionRate: number;
  thumbnailUrl?: string | null;
  galleryUrls?: string[];
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'DM Sans', sans-serif; }
    </style>
</head>
<body class="bg-white">
    <div class="min-h-screen max-w-4xl mx-auto px-4 py-12">
        <!-- Hero Section -->
        <div class="text-center mb-16">
            <h1 class="text-5xl font-bold text-gray-900 mb-6">${product.title}</h1>
            <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">${product.shortDescription || ''}</p>
            <img 
                src="${product.imageUrl || product.thumbnailUrl || 'https://via.placeholder.com/800x400'}" 
                alt="${product.title}"
                class="rounded-xl shadow-lg w-full mb-8"
            />
            <div class="inline-block bg-black text-white text-2xl font-bold px-6 py-3 rounded-full mb-4">
                €${product.basePrice.toFixed(2)}
            </div>
            <a 
                href="#buy" 
                class="block w-full sm:w-64 mx-auto bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-900 transition-colors"
            >
                Get Started
            </a>
        </div>

        <!-- Content Section -->
        <div class="prose prose-lg mx-auto mb-16">
            ${product.description}
        </div>

        ${product.galleryUrls && product.galleryUrls.length > 0 ? `
        <!-- Gallery Grid -->
        <div class="grid grid-cols-2 gap-4 mb-16">
            ${product.galleryUrls.map(url => `
            <img 
                src="${url}" 
                alt="Product gallery" 
                class="rounded-lg hover:opacity-90 transition-opacity duration-300"
            />
            `).join('')}
        </div>
        ` : ''}

        <!-- CTA Section -->
        <div id="buy" class="text-center py-16 border-t border-gray-200">
            <h2 class="text-3xl font-bold mb-6">Ready to Transform Your Life?</h2>
            <div class="text-4xl font-bold mb-8">€${product.basePrice.toFixed(2)}</div>
            <a 
                href="#" 
                class="inline-block bg-black text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-gray-900 transition-colors"
                onclick="window.parent.postMessage('purchase_clicked', '*')"
            >
                Buy Now
            </a>
            <p class="mt-4 text-sm text-gray-500">Secure payment • Instant access</p>
        </div>
    </div>

    <!-- Floating Price Badge -->
    <div class="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded-full shadow-lg">
        <span class="font-bold">€${product.basePrice.toFixed(2)}</span>
    </div>
</body>
</html>
`; 