export const modernTemplate = (product: {
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Hero Section -->
        <div class="bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 class="text-4xl font-bold text-gray-900 mb-6">${product.title}</h1>
                        <p class="text-xl text-gray-600 mb-8">${product.shortDescription || ''}</p>
                        <div class="bg-green-100 text-green-800 text-lg font-semibold px-4 py-2 rounded-md inline-block mb-8">
                            Special Offer: €${product.basePrice.toFixed(2)}
                        </div>
                        <div class="bg-blue-100 text-blue-800 text-lg font-semibold px-4 py-2 rounded-md inline-block mb-8">
                            Your Commission: €${product.commissionRate.toFixed(2)}
                        </div>
                        <a href="#buy-now" class="block w-full sm:w-auto text-center bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors">
                            Get Started Now
                        </a>
                    </div>
                    <div class="relative">
                        <img 
                            src="${product.imageUrl || product.thumbnailUrl || 'https://via.placeholder.com/600x400'}" 
                            alt="${product.title}"
                            class="rounded-lg shadow-xl w-full"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="prose prose-lg max-w-none">
                    ${product.description}
                </div>
            </div>
        </div>

        <!-- Gallery Section -->
        ${product.galleryUrls && product.galleryUrls.length > 0 ? `
        <div class="bg-white py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${product.galleryUrls.map(url => `
                    <img src="${url}" alt="Product gallery" class="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"/>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}

        <!-- CTA Section -->
        <div id="buy-now" class="bg-indigo-700 py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl font-bold text-white mb-8">Ready to Get Started?</h2>
                <div class="text-5xl font-bold text-white mb-8">€${product.basePrice.toFixed(2)}</div>
                <div class="text-2xl font-bold text-white mb-8">Your Commission: €${product.commissionRate.toFixed(2)}</div>
                <a 
                    href="#" 
                    class="inline-block bg-white text-indigo-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
                    onclick="window.parent.postMessage('purchase_clicked', '*')"
                >
                    Buy Now
                </a>
            </div>
        </div>
    </div>
</body>
</html>
`; 