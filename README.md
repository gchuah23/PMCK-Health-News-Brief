# PMCK Health News Brief

This is a web application that provides a curated feed of health-related news. It uses the Google Gemini API to find and summarize recent articles, and it leverages Supabase for caching to improve performance and reduce API costs.

## Features

- **Categorized News:** View news from three distinct categories: PMCK, Asia, and Global.
- **AI-Powered Summaries:** Each article includes an AI-generated key takeaway and five summary bullet points.
- **AI-Generated Illustrations:** Every news card features a unique cartoon illustration related to the article's content.
- **Supabase Caching:** Fetched articles are stored in a Supabase database to provide instant loading for subsequent visits and reduce API usage.
- **Date Filtering:** Users can filter articles by year and month.
- **Responsive Design:** A clean, responsive interface built with Tailwind CSS.

## Setup and Installation

To run this project, you will need a Supabase account and a Google Gemini API key.

### 1. Supabase Configuration

This project requires a Supabase backend to store and cache news articles.

1.  **Create a Supabase Project:** Go to [supabase.com](https://supabase.com) and create a new project.
2.  **Run the SQL Script:** In your Supabase project, navigate to the **SQL Editor**, create a new query, and run the SQL script provided within the application's setup screen. This will create the necessary `articles` table and set up security policies.
3.  **Launch the App:** When you first run the application, it will prompt you for your Supabase credentials:
    - **Supabase Project URL**
    - **Supabase Anon (Public) Key**
4.  **Test and Save:** Use the "Test Connection" button to verify your credentials and table setup. Once successful, save the configuration. The app will store these credentials securely in your browser's local storage for future visits.

### 2. Gemini API Key

The application requires a Google Gemini API key to fetch news. This key must be available as an environment variable named `API_KEY`.

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL Database)
- **AI / Services:** Google Gemini API
