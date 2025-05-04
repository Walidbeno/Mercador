export const modernTemplate = (product: {
  title: string;
  description: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  basePrice: number;
  commissionRate: number;
  thumbnailUrl?: string | null;
  galleryUrls?: string[];
  settings?: {
    customTitle?: string;
    customDescription?: string;
    showGallery?: boolean;
    showDescription?: boolean;
    showCommission?: boolean;
    ctaText?: string;
    ctaButtonText?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    testimonials?: Array<{
      text: string;
      author: string;
      rating?: number;
    }>;
    customSections?: Array<{
      title: string;
      content: string;
      position: 'top' | 'middle' | 'bottom';
    }>;
  }
}) => {
  const settings = product.settings || {};
  const showGallery = settings.showGallery ?? true;
  const showDescription = settings.showDescription ?? true;
  const showCommission = settings.showCommission ?? true;

  const renderCustomSections = (position: 'top' | 'middle' | 'bottom') => {
    return settings.customSections
      ?.filter(section => section.position === position)
      .map(section => `
        <div class="py-12">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">${section.title}</h2>
            <div class="prose prose-lg max-w-none">
              ${section.content}
            </div>
          </div>
        </div>
      `).join('') || '';
  };

  const renderTestimonials = () => {
    if (!settings.testimonials?.length) return '';
    
    return `
      <div class="bg-gray-50 py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">What Our Customers Say</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${settings.testimonials.map(testimonial => `
              <div class="bg-white p-6 rounded-xl shadow-md">
                <div class="mb-4">
                  ${Array.from({ length: testimonial.rating || 5 }).map(() => '⭐').join('')}
                </div>
                <p class="text-gray-600 mb-4">"${testimonial.text}"</p>
                <p class="font-semibold text-gray-900">- ${testimonial.author}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${settings.customTitle || product.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=${settings.fontFamily || 'Inter'}:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { 
          font-family: '${settings.fontFamily || 'Inter'}', sans-serif;
          ${settings.primaryColor ? `--primary-color: ${settings.primaryColor};` : ''}
          ${settings.secondaryColor ? `--secondary-color: ${settings.secondaryColor};` : ''}
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-white">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-6">${settings.customTitle || product.title}</h1>
                    <p class="text-xl text-gray-600 mb-8">${product.shortDescription || ''}</p>
                    ${showCommission ? `
                    <div class="space-y-4 mb-8">
                        <div class="bg-green-100 text-green-800 text-lg font-semibold px-4 py-2 rounded-md inline-block">
                            Base Price: €${product.basePrice.toFixed(2)}
                        </div>
                        <div class="bg-blue-100 text-blue-800 text-lg font-semibold px-4 py-2 rounded-md inline-block">
                            Your Commission: €${product.commissionRate.toFixed(2)}
                        </div>
                        <div class="bg-purple-100 text-purple-800 text-xl font-semibold px-4 py-2 rounded-md inline-block">
                            Total Price: €${(product.basePrice + product.commissionRate).toFixed(2)}
                        </div>
                    </div>
                    ` : ''}
                    <a 
                        href="#buy-now" 
                        class="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors"
                    >
                        ${settings.ctaButtonText || 'Get Started Now'}
                    </a>
                </div>
                <div class="relative">
                    <img 
                        src="${product.imageUrl || product.thumbnailUrl || 'https://via.placeholder.com/600x400'}" 
                        alt="${settings.customTitle || product.title}"
                        class="rounded-lg shadow-xl w-full"
                    />
                </div>
            </div>
        </div>
    </div>

    ${renderCustomSections('top')}

    <!-- Key Features Section -->
    <div class="bg-white py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center p-6">
                    <div class="text-4xl mb-4">🎯</div>
                    <h3 class="text-xl font-semibold mb-2">Premium Quality</h3>
                    <p class="text-gray-600">Experience excellence with our carefully curated product.</p>
                </div>
                <div class="text-center p-6">
                    <div class="text-4xl mb-4">⚡</div>
                    <h3 class="text-xl font-semibold mb-2">Instant Access</h3>
                    <p class="text-gray-600">Get immediate access after purchase.</p>
                </div>
                <div class="text-center p-6">
                    <div class="text-4xl mb-4">🔒</div>
                    <h3 class="text-xl font-semibold mb-2">Secure Purchase</h3>
                    <p class="text-gray-600">Your transaction is protected and secure.</p>
                </div>
            </div>
        </div>
    </div>

    ${showDescription ? `
    <!-- Description Section -->
    <div class="py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="prose prose-lg max-w-none">
                ${settings.customDescription || product.description}
            </div>
        </div>
    </div>
    ` : ''}

    ${renderCustomSections('middle')}

    ${renderTestimonials()}

    ${showGallery && product.galleryUrls && product.galleryUrls.length > 0 ? `
    <!-- Gallery Section -->
    <div class="bg-white py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Gallery</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                ${product.galleryUrls.map(url => `
                <img src="${url}" alt="Product gallery" class="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"/>
                `).join('')}
            </div>
        </div>
    </div>
    ` : ''}

    <!-- FAQ Section -->
    <div class="bg-gray-50 py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
            <div class="grid gap-6 max-w-3xl mx-auto">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-2">How does the purchase process work?</h3>
                    <p class="text-gray-600">Once you click the buy button, you'll be directed to our secure checkout process. After completing your purchase, you'll receive immediate access to the product.</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-2">Is there a money-back guarantee?</h3>
                    <p class="text-gray-600">Yes, we offer a satisfaction guarantee. If you're not completely satisfied, contact our support team within 30 days of purchase.</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-2">What kind of support is included?</h3>
                    <p class="text-gray-600">You'll receive full access to our customer support team who can assist you with any questions or concerns you may have.</p>
                </div>
            </div>
        </div>
    </div>

    ${renderCustomSections('bottom')}

    <!-- CTA Section -->
    <div id="buy-now" class="bg-indigo-700 py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold text-white mb-8">${settings.ctaText || 'Ready to Get Started?'}</h2>
            ${showCommission ? `
            <div class="space-y-4 mb-8">
                <div class="text-4xl font-bold text-white mb-4">Base Price: €${product.basePrice.toFixed(2)}</div>
                <div class="text-2xl font-bold text-white mb-4">Your Commission: €${product.commissionRate.toFixed(2)}</div>
                <div class="text-3xl font-bold text-white mb-8">Total Price: €${(product.basePrice + product.commissionRate).toFixed(2)}</div>
            </div>
            ` : ''}
            <a 
                href="#" 
                class="inline-block bg-white text-indigo-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
                onclick="window.parent.postMessage('purchase_clicked', '*')"
            >
                ${settings.ctaButtonText || 'Buy Now'}
            </a>
            <p class="mt-4 text-sm text-indigo-200">Secure payment • Instant access • 24/7 Support</p>
        </div>
    </div>

    <!-- Trust Badges -->
    <div class="bg-white py-8">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-center items-center space-x-8">
                <div class="text-center">
                    <div class="text-3xl mb-2">🔒</div>
                    <div class="text-sm text-gray-600">Secure Payment</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl mb-2">⚡</div>
                    <div class="text-sm text-gray-600">Instant Delivery</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl mb-2">💯</div>
                    <div class="text-sm text-gray-600">Satisfaction Guaranteed</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;}; 