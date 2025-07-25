# Build24 - Next.js + Notion Blog

A modern blog built with Next.js and designed for the Build24 challenge - building 24 projects in 24 hours.

## Features

- 🎨 Modern, clean design with black background and yellow accents
- 📱 Fully responsive layout
- 📝 Blog integration ready for Notion API
- 🚀 Fast, static site generation
- 🎯 SEO optimized
- 💻 Project showcase
- 📧 Newsletter subscription
- ⚡ Built with Next.js 13+ and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Content**: Ready for Notion API integration
- **Deployment**: Vercel, Netlify, or any static hosting
- **Icons**: Lucide React

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Notion Integration

To connect with Notion:

1. Create a Notion integration at https://developers.notion.com/
2. Create a database in Notion for your blog posts
3. Add your Notion API key and database ID to environment variables
4. Update the `/lib/notion.ts` file with your actual Notion API calls

### Environment Variables

Create a `.env.local` file with:

```env
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id
```

## Project Structure

```
├── app/
│   ├── blog/           # Blog pages
│   ├── projects/       # Project showcase
│   ├── about/          # About page
│   └── page.tsx        # Homepage
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Navigation header
│   ├── Newsletter.tsx  # Newsletter signup
│   └── ProjectCard.tsx # Project display card
├── lib/
│   ├── notion.ts       # Notion API integration
│   └── utils.ts        # Utility functions
└── public/             # Static assets
```

## Customization

### Colors
The design uses a black and yellow color scheme. To customize:
- Primary: Yellow (#FBBF24)
- Background: Black (#000000)
- Text: White (#FFFFFF)
- Accent: Gray tones

### Content
- Update the hero section in `app/page.tsx`
- Modify project data in components
- Add your own blog posts via Notion integration

## Blog Post Structure

Blog posts should include:
- Title and excerpt
- Publication date
- Reading time estimate
- Tags/categories
- Hour number (for Build24 format)
- Status (completed/in-progress/planned)

## Deployment

The site is configured for static export and can be deployed to:

- **Vercel**: Connect your GitHub repo
- **Netlify**: Deploy from Git
- **GitHub Pages**: Use the built files from `npm run build`

## License

This project is licensed under the Community License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
