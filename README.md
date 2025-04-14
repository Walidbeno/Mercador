# Mercador Landing Page Generator

A Next.js application that generates and serves dynamic landing pages for products from the Mercacio APP.

## Features

- Dynamic landing page generation
- Multi-language support
- Affiliate customization
- API-driven product management
- Template-based page rendering

## Tech Stack

- Next.js
- TypeScript
- Prisma (PostgreSQL)
- TailwindCSS

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mercador.git
cd mercador
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your database credentials.

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

### API Usage

To create a product with landing pages:

```bash
curl -X POST https://your-domain.com/api/products/create \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "mercacioId": "product-123",
    "name": "Amazing Product",
    "description": "Product description",
    "basePrice": 99.99,
    "currency": "EUR",
    "landingPages": [
      {
        "locale": "es",
        "template": "<template-content>",
        "customData": {}
      }
    ]
  }'
```

## Project Structure

```
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── pages/          
│   │   ├── api/        # API endpoints
│   │   └── [slug].tsx  # Dynamic landing pages
│   └── lib/            # Utilities
└── public/             # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 