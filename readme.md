# SweetSpots

SweetSpots is a React Native mobile application built with Expo that helps users discover and rate houses offering candy nearby. Users can view spots on a map, add new locations, rate candies, save favorites, and report spots.

## Demo

- [Demo 1](https://hc-cdn.hel1.your-objectstorage.com/s/v3/4ba733c4b82e1ee3657b6923644865882e8de74f_screenrecording_11-03-2025_11-22-27_1.mp4)
- [Demo 2](https://hc-cdn.hel1.your-objectstorage.com/s/v3/1ddd90b0d298218aa5cfca1e9c371fd0b8888371_screenrecording_11-03-2025_11-24-22_1.mp4)

## Installation

1. Ensure you have **Node.js** and **npm** installed.
2. Install Expo CLI globally:
   ```bash
   npm install -g @expo/cli
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/sebcun/SweetSpots.git
   cd SweetSpots
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Setup

### Prerequisites

- A [Supabase](https://supabase.com) account and project.

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once your project is set up, navigate to the **SQL Editor** in your Supabase dashboard.
3. Run the following SQL commands to create the necessary tables:

   ```sql
   CREATE TABLE spots (
     id SERIAL PRIMARY KEY,
     address TEXT NOT NULL,
     candies TEXT NOT NULL,
     lat FLOAT NOT NULL,
     lon FLOAT NOT NULL,
     ip TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE ratings (
     id SERIAL PRIMARY KEY,
     spot_id INTEGER REFERENCES spots(id) ON DELETE CASCADE,
     rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
     ip TEXT NOT NULL,
     comment TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE reports (
     id SERIAL PRIMARY KEY,
     spot_id INTEGER REFERENCES spots(id) ON DELETE CASCADE,
     reason TEXT NOT NULL,
     ip TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. In your Supabase project settings, find your **Project URL** and **Anon Key**.
5. Create a file at `constants/supabase.ts` and update it with your Supabase credentials:

   ```ts
   import { createClient } from "@supabase/supabase-js";

   const supabaseUrl = "YOUR_SUPABASE_URL";
   const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

## Usage

1. Start the Expo development server:
   ```bash
   npm start
   ```
2. Use the **Expo Go** app on your mobile device to scan the QR code and run the app.
