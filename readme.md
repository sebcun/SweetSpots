# SweetSpots

SweetSpots is a React Native mobile application built with Expo that helps users discover and rate houses offering candy nearby. Users can view spots on a map, add new locations, rate candies, save favorites, and report spots.

## Demo

## Installation

1. Ensure you have Node.js and npm installed.
2. Install Expo CLI globally:
   `npm install -g @expo/cli`
3. Clone the repository:

````git clone https://github.com/sebcun/SweetSpots.git
cd SweetSpots```
4. Install dependencies:
```npm install```

## Setup

### Prerequisites

- A Supabase account and project.

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once your project is set up, navigate to the SQL Editor in your Supabase dashboard.
3. Run the following SQL command to create the necessary tables:

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
);```

4. In your Supabase project settings, find your project URL and anon key.
5. Create a file ``constants/supabase.ts`` and update it with your Supabase URL and anon key:
```import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);```

## Usage
1. Start the Expo development server:
```npm start```
2. Use the Expo Go app on your mobile device to scan the QR code and run the app
````
