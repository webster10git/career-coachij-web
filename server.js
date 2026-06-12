require('dotenv').config(); // Load variables from your hidden .env file
const express = require('express');
const { Pool } = require('pg'); // Import the PostgreSQL connection pool

const app = express();
const PORT = process.env.PORT || 3000;

// Setup connection pool to your cloud database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for cloud providers like Neon/Render
});

// Test database connection right at startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error acquiring database client:', err.stack);
    }
    console.log('🚀 Successfully connected to the Cloud PostgreSQL Database!');
    release();
});

// Middleware to parse incoming payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from your root folder
app.use(express.static('.'));

/**
 * Endpoint: Healthcare Pathway Registrations
 */
app.post('/api/healthcare', async (req, res) => {
    try {
        const { name, email, mobile, country, position, qualification, experience, b2_status, issuer, fluency, statement } = req.body;
        
        const queryText = `
            INSERT INTO healthcare_applications (name, email, mobile, country, position, qualification, experience, b2_status, issuer, fluency_score, statement)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        const values = [name, email, mobile, country, position, qualification, parseInt(experience) || 0, b2_status, issuer, parseInt(fluency) || 1, statement];
        
        await pool.query(queryText, values);
        console.log(`✔ Healthcare entry saved to Cloud DB for: ${name}`);

        return res.status(201).json({ success: true, message: 'Healthcare recruitment entry saved successfully.' });
    } catch (error) {
        console.error('Error processing healthcare application:', error);
        return res.status(500).json({ success: false, message: 'Internal server processing error.' });
    }
});

/**
 * Endpoint: Free Webinar Registration Hub
 */
app.post('/api/webinar', async (req, res) => {
    try {
        const { name, email, whatsapp, interest, qualification, german_status, timeline, field_of_study, ielts_status, source, urgency, joined_webinar_group, joined_lang_group } = req.body;
        
        // Convert checkbox strings/on status safely to booleans
        const isJoinedWebinar = joined_webinar_group === 'on' || joined_webinar_group === true;
        const isJoinedLang = joined_lang_group === 'on' || joined_lang_group === true;

        const queryText = `
            INSERT INTO webinar_registrations (name, email, whatsapp, interest_area, qualification, german_status, timeline, field_of_study, ielts_status, source, urgency_index, joined_webinar_group, joined_lang_group)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `;
        const values = [name, email, whatsapp, interest, qualification, german_status, timeline, field_of_study, ielts_status, source, parseInt(urgency) || 3, isJoinedWebinar, isJoinedLang];

        await pool.query(queryText, values);
        console.log(`✔ Webinar entry saved to Cloud DB for: ${name}`);

        return res.status(201).json({ success: true, message: 'Webinar seat reserved successfully.' });
    } catch (error) {
        console.error('Error processing webinar registration:', error);
        return res.status(500).json({ success: false, message: 'Internal server processing error.' });
    }
});

/**
 * Endpoint: Study In Austria 1-on-1 Consultations
 */
app.post('/api/austria', async (req, res) => {
    try {
        const { name, email, phone, education, field_of_interest, study_level, start_date, schedule_session, availability, join_whatsapp_group } = req.body;
        
        const availabilitySlots = Array.isArray(availability) ? availability.join('; ') : availability;
        const isJoinWA = join_whatsapp_group === 'on' || join_whatsapp_group === true;
        // Check if date is empty string, save as null instead of crashing SQL
        const formattedDate = start_date && start_date.trim() !== '' ? start_date : null;

        const queryText = `
            INSERT INTO austria_consultations (name, email, phone, education, field_of_interest, study_level, start_date, wants_1on1, availability_slots, join_whatsapp_group)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        const values = [name, email, phone, education, field_of_interest, study_level, formattedDate, schedule_session, availabilitySlots, isJoinWA];

        await pool.query(queryText, values);
        console.log(`✔ Austria entry saved to Cloud DB for: ${name}`);

        return res.status(201).json({ success: true, message: 'Austria guidance request processed.' });
    } catch (error) {
        console.error('Error processing Austria consultation:', error);
        return res.status(500).json({ success: false, message: 'Internal server processing error.' });
    }
});

// Start listening for requests
app.listen(PORT, () => {
    console.log(`Backend server processing live data on port ${PORT}`);
});