// Define the translation object types
interface TranslationSet {
  [key: string]: string;
}

interface NavTranslations {
  [language: string]: TranslationSet;
}

// Navigation translations
export const navTranslations: NavTranslations = {
  en: {
    home: 'Home',
    policy: 'Sales Policy',
    contact: 'Contact Us',
    catalogue: 'Products',
    shipping: 'Shipping',
    about: 'About Us',
    // Page titles
    contactPageTitle: 'Contact Us',
    policyPageTitle: 'Sales Policy',
    cataloguePageTitle: 'Our Products',
    shippingPageTitle: 'Shipping Policy',
    aboutPageTitle: 'About Us',
    // Contact form
    contactFormTitle: 'Get in touch',
    contactFormSubtitle: 'Have questions about our products or services? Fill out the form and our team will get back to you as soon as possible.',
    nameLabel: 'Name',
    emailLabel: 'Email',
    messageLabel: 'Message',
    sendButton: 'Send Message',
    thankYouTitle: 'Thank you for your message!',
    thankYouMessage: 'We have received your inquiry and will get back to you as soon as possible.',
    // Policy page
    termsTitle: 'Terms & Conditions',
    // Product page
    buyNowButton: 'Buy Now',
    orderNowButton: 'Order Now',
    basePrice: 'Base Price',
    commission: 'Commission',
    totalPrice: 'Total Price'
  },
  es: {
    home: 'Inicio',
    policy: 'Política de Venta',
    contact: 'Contáctenos',
    catalogue: 'Productos',
    shipping: 'Envíos',
    about: 'Nosotros',
    // Page titles
    contactPageTitle: 'Contacto',
    policyPageTitle: 'Política de Venta',
    cataloguePageTitle: 'Nuestros Productos',
    shippingPageTitle: 'Política de Envío',
    aboutPageTitle: 'Sobre Nosotros',
    // Contact form
    contactFormTitle: 'Póngase en contacto',
    contactFormSubtitle: '¿Tiene preguntas sobre nuestros productos o servicios? Complete el formulario y nuestro equipo se comunicará con usted lo antes posible.',
    nameLabel: 'Nombre',
    emailLabel: 'Correo electrónico',
    messageLabel: 'Mensaje',
    sendButton: 'Enviar Mensaje',
    thankYouTitle: '¡Gracias por su mensaje!',
    thankYouMessage: 'Hemos recibido su consulta y nos comunicaremos con usted lo antes posible.',
    // Policy page
    termsTitle: 'Términos y Condiciones',
    // Product page
    buyNowButton: 'Comprar Ahora',
    orderNowButton: 'Ordenar Ahora',
    basePrice: 'Precio Base',
    commission: 'Comisión',
    totalPrice: 'Precio Total'
  },
  fr: {
    home: 'Accueil',
    policy: 'Politique de Vente',
    contact: 'Contactez-nous',
    catalogue: 'Produits',
    shipping: 'Livraison',
    about: 'À Propos',
    // Page titles
    contactPageTitle: 'Contactez-nous',
    policyPageTitle: 'Politique de Vente',
    cataloguePageTitle: 'Nos Produits',
    shippingPageTitle: 'Politique de Livraison',
    aboutPageTitle: 'À Propos de Nous',
    // Contact form
    contactFormTitle: 'Prendre contact',
    contactFormSubtitle: 'Vous avez des questions sur nos produits ou services? Remplissez le formulaire et notre équipe vous répondra dans les plus brefs délais.',
    nameLabel: 'Nom',
    emailLabel: 'Email',
    messageLabel: 'Message',
    sendButton: 'Envoyer le Message',
    thankYouTitle: 'Merci pour votre message!',
    thankYouMessage: 'Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.',
    // Policy page
    termsTitle: 'Termes et Conditions',
    // Product page
    buyNowButton: 'Acheter Maintenant',
    orderNowButton: 'Commander Maintenant',
    basePrice: 'Prix de Base',
    commission: 'Commission',
    totalPrice: 'Prix Total'
  },
  pt: {
    home: 'Início',
    policy: 'Política de Vendas',
    contact: 'Contate-nos',
    catalogue: 'Produtos',
    shipping: 'Envio',
    about: 'Sobre Nós',
    // Page titles
    contactPageTitle: 'Contate-nos',
    policyPageTitle: 'Política de Vendas',
    cataloguePageTitle: 'Nossos Produtos',
    shippingPageTitle: 'Política de Envio',
    aboutPageTitle: 'Sobre Nós',
    // Contact form
    contactFormTitle: 'Entre em contato',
    contactFormSubtitle: 'Tem dúvidas sobre nossos produtos ou serviços? Preencha o formulário e nossa equipe entrará em contato o mais breve possível.',
    nameLabel: 'Nome',
    emailLabel: 'Email',
    messageLabel: 'Mensagem',
    sendButton: 'Enviar Mensagem',
    thankYouTitle: 'Obrigado pela sua mensagem!',
    thankYouMessage: 'Recebemos sua consulta e entraremos em contato o mais breve possível.',
    // Policy page
    termsTitle: 'Termos e Condições',
    // Product page
    buyNowButton: 'Comprar Agora',
    orderNowButton: 'Pedir Agora',
    basePrice: 'Preço Base',
    commission: 'Comissão',
    totalPrice: 'Preço Total'
  },
  de: {
    home: 'Startseite',
    policy: 'Verkaufsbedingungen',
    contact: 'Kontakt',
    catalogue: 'Produkte',
    shipping: 'Versand',
    about: 'Über Uns',
    // Page titles
    contactPageTitle: 'Kontakt',
    policyPageTitle: 'Verkaufsbedingungen',
    cataloguePageTitle: 'Unsere Produkte',
    shippingPageTitle: 'Versandrichtlinien',
    aboutPageTitle: 'Über Uns',
    // Contact form
    contactFormTitle: 'Kontakt aufnehmen',
    contactFormSubtitle: 'Haben Sie Fragen zu unseren Produkten oder Dienstleistungen? Füllen Sie das Formular aus und unser Team wird sich so schnell wie möglich bei Ihnen melden.',
    nameLabel: 'Name',
    emailLabel: 'E-Mail',
    messageLabel: 'Nachricht',
    sendButton: 'Nachricht Senden',
    thankYouTitle: 'Vielen Dank für Ihre Nachricht!',
    thankYouMessage: 'Wir haben Ihre Anfrage erhalten und werden uns so schnell wie möglich bei Ihnen melden.',
    // Policy page
    termsTitle: 'Geschäftsbedingungen',
    // Product page
    buyNowButton: 'Jetzt Kaufen',
    orderNowButton: 'Jetzt Bestellen',
    basePrice: 'Grundpreis',
    commission: 'Provision',
    totalPrice: 'Gesamtpreis'
  },
  it: {
    home: 'Home',
    policy: 'Politica di Vendita',
    contact: 'Contattaci',
    catalogue: 'Prodotti',
    shipping: 'Spedizione',
    about: 'Chi Siamo',
    // Page titles
    contactPageTitle: 'Contattaci',
    policyPageTitle: 'Politica di Vendita',
    cataloguePageTitle: 'I Nostri Prodotti',
    shippingPageTitle: 'Politica di Spedizione',
    aboutPageTitle: 'Chi Siamo',
    // Contact form
    contactFormTitle: 'Mettiti in contatto',
    contactFormSubtitle: 'Hai domande sui nostri prodotti o servizi? Compila il modulo e il nostro team ti risponderà il prima possibile.',
    nameLabel: 'Nome',
    emailLabel: 'Email',
    messageLabel: 'Messaggio',
    sendButton: 'Invia Messaggio',
    thankYouTitle: 'Grazie per il tuo messaggio!',
    thankYouMessage: 'Abbiamo ricevuto la tua richiesta e ti risponderemo il prima possibile.',
    // Policy page
    termsTitle: 'Termini e Condizioni',
    // Product page
    buyNowButton: 'Acquista Ora',
    orderNowButton: 'Ordina Ora',
    basePrice: 'Prezzo Base',
    commission: 'Commissione',
    totalPrice: 'Prezzo Totale'
  }
};

// Get translation text based on language code
export function getTranslation(language: string = 'en', key: string): string {
  // Default to English if language is not supported
  if (!navTranslations[language]) {
    language = 'en';
  }
  
  // If key doesn't exist, return the key itself
  return navTranslations[language][key] || key;
} 