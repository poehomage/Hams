import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0d1e2a2d/health", (c) => {
  return c.json({ status: "ok" });
});

// Save artwork data table
app.post("/make-server-0d1e2a2d/save-data", async (c) => {
  try {
    const { data } = await c.req.json();
    
    if (!data || !Array.isArray(data)) {
      return c.json({ error: "Invalid data format" }, 400);
    }
    
    await kv.set("artwork_data", data);
    console.log(`✅ Saved ${data.length} rows to artwork_data`);
    
    return c.json({ 
      success: true, 
      message: `Saved ${data.length} rows successfully` 
    });
  } catch (error) {
    console.error("Error saving artwork data:", error);
    return c.json({ error: `Failed to save data: ${error.message}` }, 500);
  }
});

// Load artwork data table
app.get("/make-server-0d1e2a2d/load-data", async (c) => {
  try {
    const data = await kv.get("artwork_data");
    
    if (!data) {
      console.log("No artwork data found in database");
      return c.json({ data: [] });
    }
    
    console.log(`✅ Loaded ${data.length} rows from artwork_data`);
    return c.json({ data });
  } catch (error) {
    console.error("Error loading artwork data:", error);
    return c.json({ error: `Failed to load data: ${error.message}` }, 500);
  }
});

// Save recipe table
app.post("/make-server-0d1e2a2d/save-recipes", async (c) => {
  try {
    const { recipes } = await c.req.json();
    
    if (!recipes || !Array.isArray(recipes)) {
      return c.json({ error: "Invalid recipes format" }, 400);
    }
    
    await kv.set("recipe_table", recipes);
    console.log(`✅ Saved ${recipes.length} recipes to recipe_table`);
    
    return c.json({ 
      success: true, 
      message: `Saved ${recipes.length} recipes successfully` 
    });
  } catch (error) {
    console.error("Error saving recipe data:", error);
    return c.json({ error: `Failed to save recipes: ${error.message}` }, 500);
  }
});

// Load recipe table
app.get("/make-server-0d1e2a2d/load-recipes", async (c) => {
  try {
    const recipes = await kv.get("recipe_table");
    
    if (!recipes) {
      console.log("No recipe data found in database");
      return c.json({ recipes: [] });
    }
    
    console.log(`✅ Loaded ${recipes.length} recipes from recipe_table`);
    return c.json({ recipes });
  } catch (error) {
    console.error("Error loading recipe data:", error);
    return c.json({ error: `Failed to load recipes: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);