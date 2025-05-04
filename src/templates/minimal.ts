export const minimalTemplate = (product: {
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
        <div class="my-16">
          <h2 class="text-2xl font-bold mb-6">${section.title}</h2>
          <div class="prose max-w-none">
            ${section.content}
          </div>
        </div>
      `).join('') || '';
  };

  const renderTestimonials = () => {
    if (!settings.testimonials?.length) return '';
    
    return `
      <div class="my-16">
        <h2 class="text-2xl font-bold text-center mb-8">What Our Customers Say</h2>
        <div class="space-y-6">
          ${settings.testimonials.map(testimonial => `
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="mb-2">
                ${Array.from({ length: testimonial.rating || 5 }).map(() => '⭐').join('')}
              </div>
              <p class="text-gray-700 mb-4">"${testimonial.text}"</p>
              <p class="font-medium">- ${testimonial.author}</p>
            </div>
          `).join('')}
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
    <link href="https://fonts.googleapis.com/css2?family=${settings.fontFamily || 'DM Sans'}:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body { 
          font-family: '${settings.fontFamily || 'DM Sans'}', sans-serif;
          ${settings.primaryColor ? `--primary-color: ${settings.primaryColor};` : ''}
          ${settings.secondaryColor ? `--secondary-color: ${settings.secondaryColor};` : ''}
        }
    </style>
</head>
<body class="bg-white">
    <div class="max-w-5xl mx-auto px-4 py-12">
        <!-- Hero Section -->
        <div class="text-center mb-16">
            <h1 class="text-4xl font-bold text-gray-900 mb-6">${settings.customTitle || product.title}</h1>
            <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">${product.shortDescription || ''}</p>
            <img 
                src="${product.imageUrl || product.thumbnailUrl || 'https://via.placeholder.com/800x400'}" 
                alt="${settings.customTitle || product.title}"
                class="rounded-xl shadow-lg w-full mb-8"
            />
            ${showCommission ? `
            <div class="space-y-4">
                <div class="inline-block bg-black text-white text-2xl font-bold px-6 py-3 rounded-full">
                    Base Price: €${product.basePrice.toFixed(2)}
                </div>
                <div class="block bg-blue-600 text-white text-xl font-bold px-6 py-3 rounded-full">
                    Your Commission: €${product.commissionRate.toFixed(2)}
                </div>
                <div class="block bg-green-600 text-white text-2xl font-bold px-6 py-3 rounded-full">
                    Total Price: €${(product.basePrice + product.commissionRate).toFixed(2)}
                </div>
            </div>
            ` : ''}
            <a 
                href="#buy" 
                class="mt-6 block w-full sm:w-64 mx-auto bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-900 transition-colors"
            >
                ${settings.ctaButtonText || 'Get Started'}
            </a>
        </div>

        ${renderCustomSections('top')}

        <!-- Features Section -->
        <div class="my-16">
            <h2 class="text-2xl font-bold text-center mb-8">Why Choose Us</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-gray-50 p-6 rounded-lg">
                    <div class="text-3xl mb-4">🚀</div>
                    <h3 class="text-xl font-bold mb-2">Instant Access</h3>
                    <p class="text-gray-600">Get immediate access to your purchase with our instant delivery system.</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-lg">
                    <div class="text-3xl mb-4">💎</div>
                    <h3 class="text-xl font-bold mb-2">Premium Quality</h3>
                    <p class="text-gray-600">Experience excellence with our carefully curated products.</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-lg">
                    <div class="text-3xl mb-4">🔒</div>
                    <h3 class="text-xl font-bold mb-2">Secure Purchase</h3>
                    <p class="text-gray-600">Your transaction is protected with industry-standard security.</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-lg">
                    <div class="text-3xl mb-4">💫</div>
                    <h3 class="text-xl font-bold mb-2">Full Support</h3>
                    <p class="text-gray-600">Get help when you need it with our dedicated support team.</p>
                </div>
            </div>
        </div>

        ${showDescription ? `
        <!-- Content Section -->
        <div class="prose prose-lg mx-auto my-16">
            ${settings.customDescription || product.description}
        </div>
        ` : ''}

        ${renderCustomSections('middle')}

        ${renderTestimonials()}

        ${showGallery && product.galleryUrls && product.galleryUrls.length > 0 ? `
        <!-- Gallery Grid -->
        <div class="my-16">
            <h2 class="text-2xl font-bold text-center mb-8">Gallery</h2>
            <div class="grid grid-cols-2 gap-4">
                ${product.galleryUrls.map(url => `
                <img 
                    src="${url}" 
                    alt="Product gallery" 
                    class="rounded-lg hover:opacity-90 transition-opacity duration-300"
                />
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${renderCustomSections('bottom')}

        <!-- FAQ Section -->
        <div class="my-16">
            <h2 class="text-2xl font-bold text-center mb-8">Common Questions</h2>
            <div class="space-y-6">
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h3 class="font-bold mb-2">How do I get started?</h3>
                    <p class="text-gray-600">Simply click the purchase button and follow the secure checkout process. You'll get instant access to your product.</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h3 class="font-bold mb-2">What's included?</h3>
                    <p class="text-gray-600">You'll receive full access to the product, along with any updates and our premium support.</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h3 class="font-bold mb-2">Is there a guarantee?</h3>
                    <p class="text-gray-600">Yes, we offer a satisfaction guarantee. If you're not happy, contact us within 30 days for a full refund.</p>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div id="buy" class="text-center py-16 border-t border-gray-200">
            <h2 class="text-3xl font-bold mb-6">${settings.ctaText || 'Ready to Transform Your Life?'}</h2>
            ${showCommission ? `
            <div class="text-4xl font-bold mb-4">Base Price: €${product.basePrice.toFixed(2)}</div>
            <div class="text-2xl font-bold text-blue-600 mb-4">Your Commission: €${product.commissionRate.toFixed(2)}</div>
            <div class="text-3xl font-bold text-green-600 mb-8">Total Price: €${(product.basePrice + product.commissionRate).toFixed(2)}</div>
            ` : ''}
            <a 
                href="#" 
                class="inline-block bg-black text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-gray-900 transition-colors"
                onclick="window.parent.postMessage('purchase_clicked', '*')"
            >
                ${settings.ctaButtonText || 'Buy Now'}
            </a>
            <p class="mt-4 text-sm text-gray-500">Secure payment • Instant access • 24/7 Support</p>
        </div>

        <!-- Trust Badges -->
        <div class="flex justify-center items-center space-x-8 mt-8 py-8 border-t border-gray-200">
            <div class="text-center">
                <div class="text-3xl mb-2">🔒</div>
                <div class="text-sm text-gray-600">Secure</div>
            </div>
            <div class="text-center">
                <div class="text-3xl mb-2">⚡</div>
                <div class="text-sm text-gray-600">Instant</div>
            </div>
            <div class="text-center">
                <div class="text-3xl mb-2">💯</div>
                <div class="text-sm text-gray-600">Guaranteed</div>
            </div>
        </div>
    </div>
</body>
</html>
`;}; 