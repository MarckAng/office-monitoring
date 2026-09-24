# Office Monitoring System

A dashboard and editor for tracking office division tasks, urgent work, events, and payment periods. The dashboard presents the current information in a slide-based display, while the editor provides a single place to maintain it.

## Features

- Division task tracking with statuses and due dates
- Add, edit, and delete divisions and their tasks
- Urgent-item tracking with priority and due information
- Event calendar and activity management
- Payment-period and payment-item tracking
- Dashboard data caching, refreshed after editor changes are saved

## Technology

- PHP 8.3+
- Laravel 13
- Inertia.js 3 with React 19
- Tailwind CSS 4 and Vite
- SQLite by default; MySQL is also supported through Laravel configuration

## Requirements

- PHP 8.3 or newer with the extensions required by Laravel
- Composer
- Node.js 20+ and npm
- A supported database (SQLite or MySQL)

## Setup

1. Install the PHP dependencies:

   ```bash
   composer install
   ```

2. Create your environment file and application key:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

3. Configure the database in `.env`.

   For SQLite, create the database file if it does not exist and keep `DB_CONNECTION=sqlite`:

   ```powershell
   New-Item -ItemType File -Path database/database.sqlite -Force
   ```

   For MySQL, set `DB_CONNECTION=mysql` and provide `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`.

4. Run the database migrations:

   ```bash
   php artisan migrate
   ```

5. Install frontend dependencies:

   ```bash
   npm install
   ```

## Run locally

Start the Laravel server and Vite development server in separate terminals:

```bash
php artisan serve
```

```bash
npm run dev
```

Then open `http://localhost:8000`.

For a production asset build, run:

```bash
npm run build
```

## Using the application

| Page | Path | Purpose |
| --- | --- | --- |
| Dashboard | `/` | View division tasks, urgent items, events, and payments. |
| Task Editor | `/editor` | Create, edit, or delete all tracked information. |

In the editor, use **Add Division** to create a division, use the plus icon on a division to add tasks, and use the trash icons to remove tasks or divisions. Select **Save All** to persist changes.

## Tests and formatting

Run the test suite:

```bash
php artisan test
```

Format PHP files with Laravel Pint:

```bash
vendor/bin/pint --dirty --format agent
```

## Project structure

```text
app/Http/Controllers/    Dashboard and editor request handling
app/Models/              Division, task, event, urgent-item, and payment models
database/migrations/     Application schema
resources/js/Pages/      Inertia page components
resources/js/Components/ Dashboard and editor UI components
routes/web.php           Application and editor API routes
```

## License

This project is licensed under the MIT License.
