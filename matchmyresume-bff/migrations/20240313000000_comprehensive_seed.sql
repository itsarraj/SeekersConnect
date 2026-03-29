-- Comprehensive seed script for matchmyresume-bff
-- Truncates all tables and inserts realistic test data

-- Phase 0: Truncate all tables (respecting FK order)
TRUNCATE applications, suggested_jobs, resumes, jobs, companies CASCADE;

-- Phase 1: Insert 120+ companies
INSERT INTO companies (id, name, logo_url, website, about, industry, employee_size, head_office, company_type, since, specialization) VALUES
(gen_random_uuid(), 'Stripe', 'https://logo.clearbit.com/stripe.com', 'https://stripe.com', 'Online payment processing for internet businesses.', 'Fintech', '5001-10000', 'San Francisco, CA', 'Public', 2010, ARRAY['Payments', 'API', 'Developer Tools']),
(gen_random_uuid(), 'Vercel', 'https://logo.clearbit.com/vercel.com', 'https://vercel.com', 'The platform for frontend developers.', 'Technology', '201-500', 'San Francisco, CA', 'Private', 2015, ARRAY['Cloud', 'Frontend', 'Serverless']),
(gen_random_uuid(), 'Linear', 'https://logo.clearbit.com/linear.app', 'https://linear.app', 'The issue tracking tool you will enjoy using.', 'Technology', '51-200', 'San Francisco, CA', 'Private', 2019, ARRAY['Productivity', 'SaaS']),
(gen_random_uuid(), 'Notion', 'https://logo.clearbit.com/notion.so', 'https://notion.so', 'All-in-one workspace for notes, tasks, wikis.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2016, ARRAY['Productivity', 'Collaboration']),
(gen_random_uuid(), 'Figma', 'https://logo.clearbit.com/figma.com', 'https://figma.com', 'Collaborative interface design tool.', 'Technology', '501-1000', 'San Francisco, CA', 'Public', 2016, ARRAY['Design', 'Collaboration']),
(gen_random_uuid(), 'Airbnb', 'https://logo.clearbit.com/airbnb.com', 'https://airbnb.com', 'Vacation rentals and experiences worldwide.', 'Travel', '10001+', 'San Francisco, CA', 'Public', 2008, ARRAY['Travel', 'Marketplace']),
(gen_random_uuid(), 'Spotify', 'https://logo.clearbit.com/spotify.com', 'https://spotify.com', 'Music streaming service with millions of songs.', 'Entertainment', '10001+', 'Stockholm, Sweden', 'Public', 2008, ARRAY['Music', 'Streaming']),
(gen_random_uuid(), 'Slack', 'https://logo.clearbit.com/slack.com', 'https://slack.com', 'Business communication platform.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2013, ARRAY['Communication', 'Collaboration']),
(gen_random_uuid(), 'Shopify', 'https://logo.clearbit.com/shopify.com', 'https://shopify.com', 'E-commerce platform for online stores.', 'E-commerce', '10001+', 'Ottawa, Canada', 'Public', 2006, ARRAY['E-commerce', 'Retail']),
(gen_random_uuid(), 'GitHub', 'https://logo.clearbit.com/github.com', 'https://github.com', 'Platform for version control and collaboration.', 'Technology', '10001+', 'San Francisco, CA', 'Public', 2008, ARRAY['Developer Tools', 'Open Source']),
(gen_random_uuid(), 'Datadog', 'https://logo.clearbit.com/datadoghq.com', 'https://datadoghq.com', 'Monitoring and security platform for cloud applications.', 'Technology', '5001-10000', 'New York, NY', 'Public', 2010, ARRAY['Monitoring', 'DevOps']),
(gen_random_uuid(), 'Snowflake', 'https://logo.clearbit.com/snowflake.com', 'https://snowflake.com', 'Cloud data platform for data warehousing.', 'Technology', '5001-10000', 'Bozeman, MT', 'Public', 2012, ARRAY['Data', 'Cloud']),
(gen_random_uuid(), 'MongoDB', 'https://logo.clearbit.com/mongodb.com', 'https://mongodb.com', 'Document-oriented database platform.', 'Technology', '5001-10000', 'New York, NY', 'Public', 2007, ARRAY['Database', 'NoSQL']),
(gen_random_uuid(), 'Twilio', 'https://logo.clearbit.com/twilio.com', 'https://twilio.com', 'Cloud communications platform.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2008, ARRAY['Communications', 'API']),
(gen_random_uuid(), 'Square', 'https://logo.clearbit.com/squareup.com', 'https://squareup.com', 'Financial services and mobile payment company.', 'Fintech', '5001-10000', 'San Francisco, CA', 'Public', 2009, ARRAY['Payments', 'Fintech']),
(gen_random_uuid(), 'Dropbox', 'https://logo.clearbit.com/dropbox.com', 'https://dropbox.com', 'Cloud storage and file synchronization.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2007, ARRAY['Cloud', 'Storage']),
(gen_random_uuid(), 'Atlassian', 'https://logo.clearbit.com/atlassian.com', 'https://atlassian.com', 'Team collaboration and productivity software.', 'Technology', '10001+', 'Sydney, Australia', 'Public', 2002, ARRAY['Productivity', 'DevOps']),
(gen_random_uuid(), 'Salesforce', 'https://logo.clearbit.com/salesforce.com', 'https://salesforce.com', 'Customer relationship management platform.', 'Technology', '10001+', 'San Francisco, CA', 'Public', 1999, ARRAY['CRM', 'Enterprise']),
(gen_random_uuid(), 'Adobe', 'https://logo.clearbit.com/adobe.com', 'https://adobe.com', 'Creative and digital experience software.', 'Technology', '10001+', 'San Jose, CA', 'Public', 1982, ARRAY['Design', 'Creative']),
(gen_random_uuid(), 'Netflix', 'https://logo.clearbit.com/netflix.com', 'https://netflix.com', 'Streaming entertainment service.', 'Entertainment', '10001+', 'Los Gatos, CA', 'Public', 1997, ARRAY['Streaming', 'Entertainment']),
(gen_random_uuid(), 'Uber', 'https://logo.clearbit.com/uber.com', 'https://uber.com', 'Ridesharing and food delivery platform.', 'Transportation', '10001+', 'San Francisco, CA', 'Public', 2009, ARRAY['Mobility', 'Logistics']),
(gen_random_uuid(), 'DoorDash', 'https://logo.clearbit.com/doordash.com', 'https://doordash.com', 'Food delivery and logistics platform.', 'Logistics', '10001+', 'San Francisco, CA', 'Public', 2013, ARRAY['Delivery', 'Logistics']),
(gen_random_uuid(), 'Coinbase', 'https://logo.clearbit.com/coinbase.com', 'https://coinbase.com', 'Cryptocurrency exchange platform.', 'Fintech', '5001-10000', 'San Francisco, CA', 'Public', 2012, ARRAY['Crypto', 'Fintech']),
(gen_random_uuid(), 'Robinhood', 'https://logo.clearbit.com/robinhood.com', 'https://robinhood.com', 'Commission-free trading platform.', 'Fintech', '5001-10000', 'Menlo Park, CA', 'Public', 2013, ARRAY['Investing', 'Fintech']),
(gen_random_uuid(), 'Plaid', 'https://logo.clearbit.com/plaid.com', 'https://plaid.com', 'Financial data network connecting apps to bank accounts.', 'Fintech', '501-1000', 'San Francisco, CA', 'Private', 2013, ARRAY['Fintech', 'API']),
(gen_random_uuid(), 'Brex', 'https://logo.clearbit.com/brex.com', 'https://brex.com', 'Corporate cards and spend management.', 'Fintech', '1001-5000', 'San Francisco, CA', 'Private', 2017, ARRAY['Fintech', 'Corporate']),
(gen_random_uuid(), 'Ramp', 'https://logo.clearbit.com/ramp.com', 'https://ramp.com', 'Corporate card and spend management platform.', 'Fintech', '501-1000', 'New York, NY', 'Private', 2019, ARRAY['Fintech', 'Expense']),
(gen_random_uuid(), 'Mercury', 'https://logo.clearbit.com/mercury.com', 'https://mercury.com', 'Banking for startups.', 'Fintech', '201-500', 'San Francisco, CA', 'Private', 2019, ARRAY['Banking', 'Startups']),
(gen_random_uuid(), 'Revolut', 'https://logo.clearbit.com/revolut.com', 'https://revolut.com', 'Digital banking and financial services.', 'Fintech', '5001-10000', 'London, UK', 'Private', 2015, ARRAY['Banking', 'Fintech']),
(gen_random_uuid(), 'N26', 'https://logo.clearbit.com/n26.com', 'https://n26.com', 'Mobile-first banking platform.', 'Fintech', '1501-5000', 'Berlin, Germany', 'Private', 2013, ARRAY['Banking', 'Mobile']),
(gen_random_uuid(), 'Wise', 'https://logo.clearbit.com/wise.com', 'https://wise.com', 'International money transfer service.', 'Fintech', '5001-10000', 'London, UK', 'Public', 2011, ARRAY['Payments', 'FX']),
(gen_random_uuid(), 'Klarna', 'https://logo.clearbit.com/klarna.com', 'https://klarna.com', 'Buy now pay later and shopping platform.', 'Fintech', '5001-10000', 'Stockholm, Sweden', 'Public', 2005, ARRAY['Payments', 'BNPL']),
(gen_random_uuid(), 'Affirm', 'https://logo.clearbit.com/affirm.com', 'https://affirm.com', 'Buy now pay later financing.', 'Fintech', '5001-10000', 'San Francisco, CA', 'Public', 2012, ARRAY['Fintech', 'BNPL']),
(gen_random_uuid(), 'Chime', 'https://logo.clearbit.com/chime.com', 'https://chime.com', 'Neobank for everyday Americans.', 'Fintech', '1001-5000', 'San Francisco, CA', 'Private', 2013, ARRAY['Banking', 'Consumer']),
(gen_random_uuid(), 'SoFi', 'https://logo.clearbit.com/sofi.com', 'https://sofi.com', 'Personal finance and lending platform.', 'Fintech', '5001-10000', 'San Francisco, CA', 'Public', 2011, ARRAY['Lending', 'Investing']),
(gen_random_uuid(), 'OpenAI', 'https://logo.clearbit.com/openai.com', 'https://openai.com', 'AI research and deployment company.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2015, ARRAY['AI', 'ML']),
(gen_random_uuid(), 'Anthropic', 'https://logo.clearbit.com/anthropic.com', 'https://anthropic.com', 'AI safety and research company.', 'Technology', '201-500', 'San Francisco, CA', 'Private', 2021, ARRAY['AI', 'Safety']),
(gen_random_uuid(), 'Hugging Face', 'https://logo.clearbit.com/huggingface.co', 'https://huggingface.co', 'AI model hub and ML platform.', 'Technology', '201-500', 'New York, NY', 'Private', 2016, ARRAY['AI', 'ML']),
(gen_random_uuid(), 'Scale AI', 'https://logo.clearbit.com/scale.com', 'https://scale.com', 'Data platform for AI applications.', 'Technology', '1001-5000', 'San Francisco, CA', 'Private', 2016, ARRAY['AI', 'Data']),
(gen_random_uuid(), 'Databricks', 'https://logo.clearbit.com/databricks.com', 'https://databricks.com', 'Unified analytics and AI platform.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2013, ARRAY['Data', 'AI']),
(gen_random_uuid(), 'Snowflake', 'https://logo.clearbit.com/snowflake.com', 'https://snowflake.com', 'Cloud data platform.', 'Technology', '5001-10000', 'Bozeman, MT', 'Public', 2012, ARRAY['Data', 'Cloud']),
(gen_random_uuid(), 'dbt Labs', 'https://logo.clearbit.com/getdbt.com', 'https://getdbt.com', 'Analytics engineering platform.', 'Technology', '501-1000', 'Philadelphia, PA', 'Private', 2016, ARRAY['Data', 'Analytics']),
(gen_random_uuid(), 'Fivetran', 'https://logo.clearbit.com/fivetran.com', 'https://fivetran.com', 'Automated data integration.', 'Technology', '1001-5000', 'Oakland, CA', 'Private', 2012, ARRAY['Data', 'ETL']),
(gen_random_uuid(), 'Airbyte', 'https://logo.clearbit.com/airbyte.com', 'https://airbyte.com', 'Open-source data integration platform.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2020, ARRAY['Data', 'Open Source']),
(gen_random_uuid(), 'Retool', 'https://logo.clearbit.com/retool.com', 'https://retool.com', 'Low-code platform for internal tools.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2017, ARRAY['Developer Tools', 'Low-code']),
(gen_random_uuid(), 'Supabase', 'https://logo.clearbit.com/supabase.com', 'https://supabase.com', 'Open-source Firebase alternative.', 'Technology', '201-500', 'Singapore', 'Private', 2020, ARRAY['Database', 'Backend']),
(gen_random_uuid(), 'PlanetScale', 'https://logo.clearbit.com/planetscale.com', 'https://planetscale.com', 'Serverless MySQL platform.', 'Technology', '201-500', 'San Francisco, CA', 'Private', 2018, ARRAY['Database', 'MySQL']),
(gen_random_uuid(), 'Neon', 'https://logo.clearbit.com/neon.tech', 'https://neon.tech', 'Serverless Postgres platform.', 'Technology', '51-200', 'San Francisco, CA', 'Private', 2022, ARRAY['Database', 'Postgres']),
(gen_random_uuid(), 'Turso', 'https://logo.clearbit.com/turso.tech', 'https://turso.tech', 'Edge SQLite database.', 'Technology', '11-50', 'San Francisco, CA', 'Private', 2022, ARRAY['Database', 'Edge']),
(gen_random_uuid(), 'Cloudflare', 'https://logo.clearbit.com/cloudflare.com', 'https://cloudflare.com', 'Web infrastructure and security.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2010, ARRAY['CDN', 'Security']),
(gen_random_uuid(), 'Fastly', 'https://logo.clearbit.com/fastly.com', 'https://fastly.com', 'Edge cloud platform.', 'Technology', '1001-5000', 'San Francisco, CA', 'Public', 2011, ARRAY['CDN', 'Edge']),
(gen_random_uuid(), 'Vercel', 'https://logo.clearbit.com/vercel.com', 'https://vercel.com', 'Frontend cloud platform.', 'Technology', '201-500', 'San Francisco, CA', 'Private', 2015, ARRAY['Frontend', 'Serverless']),
(gen_random_uuid(), 'Netlify', 'https://logo.clearbit.com/netlify.com', 'https://netlify.com', 'Platform for modern web development.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2014, ARRAY['Hosting', 'JAMstack']),
(gen_random_uuid(), 'Railway', 'https://logo.clearbit.com/railway.app', 'https://railway.app', 'Infrastructure platform for developers.', 'Technology', '51-200', 'San Francisco, CA', 'Private', 2021, ARRAY['Infrastructure', 'DevOps']),
(gen_random_uuid(), 'Render', 'https://logo.clearbit.com/render.com', 'https://render.com', 'Cloud application hosting.', 'Technology', '201-500', 'San Francisco, CA', 'Private', 2018, ARRAY['Hosting', 'PaaS']),
(gen_random_uuid(), 'Fly.io', 'https://logo.clearbit.com/fly.io', 'https://fly.io', 'Deploy app servers close to users.', 'Technology', '51-200', 'Chicago, IL', 'Private', 2017, ARRAY['Edge', 'Hosting']),
(gen_random_uuid(), 'Sentry', 'https://logo.clearbit.com/sentry.io', 'https://sentry.io', 'Application monitoring and error tracking.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2010, ARRAY['Monitoring', 'Observability']),
(gen_random_uuid(), 'LaunchDarkly', 'https://logo.clearbit.com/launchdarkly.com', 'https://launchdarkly.com', 'Feature management platform.', 'Technology', '501-1000', 'Oakland, CA', 'Public', 2014, ARRAY['Feature Flags', 'DevOps']),
(gen_random_uuid(), 'PostHog', 'https://logo.clearbit.com/posthog.com', 'https://posthog.com', 'Product analytics platform.', 'Technology', '201-500', 'San Francisco, CA', 'Private', 2020, ARRAY['Analytics', 'Product']),
(gen_random_uuid(), 'Amplitude', 'https://logo.clearbit.com/amplitude.com', 'https://amplitude.com', 'Product analytics for digital products.', 'Technology', '1001-5000', 'San Francisco, CA', 'Public', 2012, ARRAY['Analytics', 'Product']),
(gen_random_uuid(), 'Mixpanel', 'https://logo.clearbit.com/mixpanel.com', 'https://mixpanel.com', 'Product analytics platform.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2009, ARRAY['Analytics', 'Product']),
(gen_random_uuid(), 'Segment', 'https://logo.clearbit.com/segment.com', 'https://segment.com', 'Customer data platform.', 'Technology', '1001-5000', 'San Francisco, CA', 'Private', 2011, ARRAY['Data', 'CDP']),
(gen_random_uuid(), 'Loom', 'https://logo.clearbit.com/loom.com', 'https://loom.com', 'Async video messaging for work.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2015, ARRAY['Video', 'Communication']),
(gen_random_uuid(), 'Miro', 'https://logo.clearbit.com/miro.com', 'https://miro.com', 'Online collaborative whiteboard.', 'Technology', '1001-5000', 'San Francisco, CA', 'Private', 2011, ARRAY['Collaboration', 'Design']),
(gen_random_uuid(), 'Airtable', 'https://logo.clearbit.com/airtable.com', 'https://airtable.com', 'Low-code platform for collaborative apps.', 'Technology', '1001-5000', 'San Francisco, CA', 'Private', 2012, ARRAY['Productivity', 'Database']),
(gen_random_uuid(), 'Coda', 'https://logo.clearbit.com/coda.io', 'https://coda.io', 'All-in-one doc for teams.', 'Technology', '201-500', 'San Francisco, CA', 'Private', 2014, ARRAY['Productivity', 'Docs']),
(gen_random_uuid(), 'Monday.com', 'https://logo.clearbit.com/monday.com', 'https://monday.com', 'Work operating system.', 'Technology', '5001-10000', 'Tel Aviv, Israel', 'Public', 2012, ARRAY['Project Management', 'Productivity']),
(gen_random_uuid(), 'Asana', 'https://logo.clearbit.com/asana.com', 'https://asana.com', 'Work management platform.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2008, ARRAY['Project Management', 'Productivity']),
(gen_random_uuid(), 'ClickUp', 'https://logo.clearbit.com/clickup.com', 'https://clickup.com', 'All-in-one productivity platform.', 'Technology', '501-1000', 'San Diego, CA', 'Private', 2017, ARRAY['Productivity', 'Project Management']),
(gen_random_uuid(), 'Basecamp', 'https://logo.clearbit.com/basecamp.com', 'https://basecamp.com', 'Project management and team communication.', 'Technology', '51-200', 'Chicago, IL', 'Private', 1999, ARRAY['Productivity', 'Project Management']),
(gen_random_uuid(), 'Raycast', 'https://logo.clearbit.com/raycast.com', 'https://raycast.com', 'Blazingly fast, extendable launcher.', 'Technology', '51-200', 'London, UK', 'Private', 2020, ARRAY['Productivity', 'Mac']),
(gen_random_uuid(), 'Spline', 'https://logo.clearbit.com/spline.design', 'https://spline.design', '3D design tool for the web.', 'Technology', '11-50', 'San Francisco, CA', 'Private', 2020, ARRAY['Design', '3D']),
(gen_random_uuid(), 'Framer', 'https://logo.clearbit.com/framer.com', 'https://framer.com', 'Design and prototyping tool.', 'Technology', '51-200', 'Amsterdam, Netherlands', 'Private', 2012, ARRAY['Design', 'Prototyping']),
(gen_random_uuid(), 'Webflow', 'https://logo.clearbit.com/webflow.com', 'https://webflow.com', 'No-code website builder.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2013, ARRAY['Design', 'No-code']),
(gen_random_uuid(), 'Canva', 'https://logo.clearbit.com/canva.com', 'https://canva.com', 'Visual design platform.', 'Technology', '5001-10000', 'Sydney, Australia', 'Private', 2013, ARRAY['Design', 'Creative']),
(gen_random_uuid(), 'Trainline', 'https://logo.clearbit.com/trainline.com', 'https://trainline.com', 'Train and coach travel booking.', 'Travel', '501-1000', 'London, UK', 'Private', 1997, ARRAY['Travel', 'Transport']),
(gen_random_uuid(), 'Booking.com', 'https://logo.clearbit.com/booking.com', 'https://booking.com', 'Online travel reservation company.', 'Travel', '10001+', 'Amsterdam, Netherlands', 'Public', 1996, ARRAY['Travel', 'Hospitality']),
(gen_random_uuid(), 'Expedia', 'https://logo.clearbit.com/expedia.com', 'https://expedia.com', 'Online travel company.', 'Travel', '10001+', 'Seattle, WA', 'Public', 1996, ARRAY['Travel', 'Hospitality']),
(gen_random_uuid(), 'Hopper', 'https://logo.clearbit.com/hopper.com', 'https://hopper.com', 'Travel booking app with price predictions.', 'Travel', '501-1000', 'Montreal, Canada', 'Private', 2007, ARRAY['Travel', 'AI']),
(gen_random_uuid(), 'GetYourGuide', 'https://logo.clearbit.com/getyourguide.com', 'https://getyourguide.com', 'Travel experiences and activities.', 'Travel', '1001-5000', 'Berlin, Germany', 'Private', 2009, ARRAY['Travel', 'Experiences']),
(gen_random_uuid(), 'Klook', 'https://logo.clearbit.com/klook.com', 'https://klook.com', 'Travel activities and services booking.', 'Travel', '1001-5000', 'Hong Kong', 'Private', 2014, ARRAY['Travel', 'Activities']),
(gen_random_uuid(), 'McKinsey', 'https://logo.clearbit.com/mckinsey.com', 'https://mckinsey.com', 'Management consulting firm.', 'Consulting', '10001+', 'New York, NY', 'Private', 1926, ARRAY['Consulting', 'Strategy']),
(gen_random_uuid(), 'BCG', 'https://logo.clearbit.com/bcg.com', 'https://bcg.com', 'Management consulting firm.', 'Consulting', '10001+', 'Boston, MA', 'Private', 1963, ARRAY['Consulting', 'Strategy']),
(gen_random_uuid(), 'Bain', 'https://logo.clearbit.com/bain.com', 'https://bain.com', 'Management consulting firm.', 'Consulting', '10001+', 'Boston, MA', 'Private', 1973, ARRAY['Consulting', 'Strategy']),
(gen_random_uuid(), 'Deloitte', 'https://logo.clearbit.com/deloitte.com', 'https://deloitte.com', 'Professional services network.', 'Consulting', '10001+', 'London, UK', 'Private', 1845, ARRAY['Consulting', 'Audit']),
(gen_random_uuid(), 'Accenture', 'https://logo.clearbit.com/accenture.com', 'https://accenture.com', 'IT consulting and professional services.', 'Consulting', '10001+', 'Dublin, Ireland', 'Public', 1989, ARRAY['Consulting', 'Technology']),
(gen_random_uuid(), 'EY', 'https://logo.clearbit.com/ey.com', 'https://ey.com', 'Professional services organization.', 'Consulting', '10001+', 'London, UK', 'Private', 1989, ARRAY['Consulting', 'Audit']),
(gen_random_uuid(), 'KPMG', 'https://logo.clearbit.com/kpmg.com', 'https://kpmg.com', 'Professional services network.', 'Consulting', '10001+', 'Amstelveen, Netherlands', 'Private', 1987, ARRAY['Consulting', 'Audit']),
(gen_random_uuid(), 'PwC', 'https://logo.clearbit.com/pwc.com', 'https://pwc.com', 'Professional services network.', 'Consulting', '10001+', 'London, UK', 'Private', 1998, ARRAY['Consulting', 'Audit']),
(gen_random_uuid(), 'Johnson & Johnson', 'https://logo.clearbit.com/jnj.com', 'https://jnj.com', 'Pharmaceutical and consumer health.', 'Healthcare', '10001+', 'New Brunswick, NJ', 'Public', 1886, ARRAY['Pharma', 'Healthcare']),
(gen_random_uuid(), 'Pfizer', 'https://logo.clearbit.com/pfizer.com', 'https://pfizer.com', 'Pharmaceutical corporation.', 'Healthcare', '10001+', 'New York, NY', 'Public', 1849, ARRAY['Pharma', 'Healthcare']),
(gen_random_uuid(), 'Moderna', 'https://logo.clearbit.com/modernatx.com', 'https://modernatx.com', 'Biotechnology company.', 'Healthcare', '1001-5000', 'Cambridge, MA', 'Public', 2010, ARRAY['Biotech', 'mRNA']),
(gen_random_uuid(), 'Oscar Health', 'https://logo.clearbit.com/hioscar.com', 'https://hioscar.com', 'Health insurance technology company.', 'Healthcare', '1001-5000', 'New York, NY', 'Public', 2012, ARRAY['Health Tech', 'Insurance']),
(gen_random_uuid(), 'Ro', 'https://logo.clearbit.com/ro.co', 'https://ro.co', 'Digital health company.', 'Healthcare', '501-1000', 'New York, NY', 'Private', 2017, ARRAY['Health Tech', 'Telehealth']),
(gen_random_uuid(), 'Hims & Hers', 'https://logo.clearbit.com/hims.com', 'https://hims.com', 'Telehealth and wellness brand.', 'Healthcare', '501-1000', 'San Francisco, CA', 'Public', 2017, ARRAY['Health Tech', 'Telehealth']),
(gen_random_uuid(), 'Zocdoc', 'https://logo.clearbit.com/zocdoc.com', 'https://zocdoc.com', 'Medical care scheduling platform.', 'Healthcare', '501-1000', 'New York, NY', 'Private', 2007, ARRAY['Health Tech', 'Scheduling']),
(gen_random_uuid(), 'Amazon', 'https://logo.clearbit.com/amazon.com', 'https://amazon.com', 'E-commerce and cloud computing.', 'Technology', '10001+', 'Seattle, WA', 'Public', 1994, ARRAY['E-commerce', 'Cloud']),
(gen_random_uuid(), 'Google', 'https://logo.clearbit.com/google.com', 'https://google.com', 'Technology company specializing in internet services.', 'Technology', '10001+', 'Mountain View, CA', 'Public', 1998, ARRAY['Search', 'Cloud']),
(gen_random_uuid(), 'Meta', 'https://logo.clearbit.com/meta.com', 'https://meta.com', 'Social media and technology company.', 'Technology', '10001+', 'Menlo Park, CA', 'Public', 2004, ARRAY['Social', 'VR']),
(gen_random_uuid(), 'Apple', 'https://logo.clearbit.com/apple.com', 'https://apple.com', 'Consumer electronics and software.', 'Technology', '10001+', 'Cupertino, CA', 'Public', 1976, ARRAY['Hardware', 'Software']),
(gen_random_uuid(), 'Microsoft', 'https://logo.clearbit.com/microsoft.com', 'https://microsoft.com', 'Technology corporation.', 'Technology', '10001+', 'Redmond, WA', 'Public', 1975, ARRAY['Software', 'Cloud']),
(gen_random_uuid(), 'Tesla', 'https://logo.clearbit.com/tesla.com', 'https://tesla.com', 'Electric vehicle and clean energy.', 'Automotive', '10001+', 'Austin, TX', 'Public', 2003, ARRAY['EV', 'Energy']),
(gen_random_uuid(), 'Rivian', 'https://logo.clearbit.com/rivian.com', 'https://rivian.com', 'Electric vehicle manufacturer.', 'Automotive', '5001-10000', 'Irvine, CA', 'Public', 2009, ARRAY['EV', 'Automotive']),
(gen_random_uuid(), 'Lucid', 'https://logo.clearbit.com/lucidmotors.com', 'https://lucidmotors.com', 'Luxury electric vehicle company.', 'Automotive', '1001-5000', 'Newark, CA', 'Public', 2007, ARRAY['EV', 'Luxury']),
(gen_random_uuid(), 'Waymo', 'https://logo.clearbit.com/waymo.com', 'https://waymo.com', 'Autonomous driving technology.', 'Automotive', '1001-5000', 'Mountain View, CA', 'Private', 2009, ARRAY['Autonomous', 'AI']),
(gen_random_uuid(), 'Cruise', 'https://logo.clearbit.com/getcruise.com', 'https://getcruise.com', 'Autonomous vehicle company.', 'Automotive', '1001-5000', 'San Francisco, CA', 'Private', 2013, ARRAY['Autonomous', 'Robotics']),
(gen_random_uuid(), 'Nvidia', 'https://logo.clearbit.com/nvidia.com', 'https://nvidia.com', 'Graphics and AI computing.', 'Technology', '10001+', 'Santa Clara, CA', 'Public', 1993, ARRAY['GPU', 'AI']),
(gen_random_uuid(), 'AMD', 'https://logo.clearbit.com/amd.com', 'https://amd.com', 'Semiconductor company.', 'Technology', '10001+', 'Santa Clara, CA', 'Public', 1969, ARRAY['Semiconductor', 'CPU']),
(gen_random_uuid(), 'Intel', 'https://logo.clearbit.com/intel.com', 'https://intel.com', 'Semiconductor and computing company.', 'Technology', '10001+', 'Santa Clara, CA', 'Public', 1968, ARRAY['Semiconductor', 'CPU']),
(gen_random_uuid(), 'Qualcomm', 'https://logo.clearbit.com/qualcomm.com', 'https://qualcomm.com', 'Semiconductor and telecommunications.', 'Technology', '10001+', 'San Diego, CA', 'Public', 1985, ARRAY['Semiconductor', 'Wireless']),
(gen_random_uuid(), 'ARM', 'https://logo.clearbit.com/arm.com', 'https://arm.com', 'Semiconductor and software design.', 'Technology', '5001-10000', 'Cambridge, UK', 'Public', 1990, ARRAY['Semiconductor', 'IP']),
(gen_random_uuid(), 'Palantir', 'https://logo.clearbit.com/palantir.com', 'https://palantir.com', 'Big data analytics company.', 'Technology', '5001-10000', 'Denver, CO', 'Public', 2003, ARRAY['Data', 'Government']),
(gen_random_uuid(), 'ServiceNow', 'https://logo.clearbit.com/servicenow.com', 'https://servicenow.com', 'Enterprise workflow platform.', 'Technology', '10001+', 'Santa Clara, CA', 'Public', 2004, ARRAY['Enterprise', 'Workflow']),
(gen_random_uuid(), 'Workday', 'https://logo.clearbit.com/workday.com', 'https://workday.com', 'Enterprise cloud applications.', 'Technology', '10001+', 'Pleasanton, CA', 'Public', 2005, ARRAY['HR', 'Finance']),
(gen_random_uuid(), 'Okta', 'https://logo.clearbit.com/okta.com', 'https://okta.com', 'Identity and access management.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2010, ARRAY['Security', 'Identity']),
(gen_random_uuid(), 'CrowdStrike', 'https://logo.clearbit.com/crowdstrike.com', 'https://crowdstrike.com', 'Cybersecurity technology company.', 'Technology', '5001-10000', 'Austin, TX', 'Public', 2011, ARRAY['Security', 'Endpoint']),
(gen_random_uuid(), 'Zscaler', 'https://logo.clearbit.com/zscaler.com', 'https://zscaler.com', 'Cloud security company.', 'Technology', '5001-10000', 'San Jose, CA', 'Public', 2008, ARRAY['Security', 'Cloud']),
(gen_random_uuid(), 'Snyk', 'https://logo.clearbit.com/snyk.io', 'https://snyk.io', 'Developer security platform.', 'Technology', '501-1000', 'Boston, MA', 'Private', 2015, ARRAY['Security', 'DevSecOps']),
(gen_random_uuid(), '1Password', 'https://logo.clearbit.com/1password.com', 'https://1password.com', 'Password manager and digital vault.', 'Technology', '501-1000', 'Toronto, Canada', 'Private', 2006, ARRAY['Security', 'Password']),
(gen_random_uuid(), 'Discord', 'https://logo.clearbit.com/discord.com', 'https://discord.com', 'Voice and text chat platform.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2015, ARRAY['Communication', 'Gaming']),
(gen_random_uuid(), 'Reddit', 'https://logo.clearbit.com/reddit.com', 'https://reddit.com', 'Social news and discussion platform.', 'Technology', '1001-5000', 'San Francisco, CA', 'Public', 2005, ARRAY['Social', 'Community']),
(gen_random_uuid(), 'Pinterest', 'https://logo.clearbit.com/pinterest.com', 'https://pinterest.com', 'Visual discovery engine.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2010, ARRAY['Social', 'E-commerce']),
(gen_random_uuid(), 'Snap', 'https://logo.clearbit.com/snap.com', 'https://snap.com', 'Camera and AR company.', 'Technology', '5001-10000', 'Santa Monica, CA', 'Public', 2011, ARRAY['Social', 'AR']),
(gen_random_uuid(), 'TikTok', 'https://logo.clearbit.com/tiktok.com', 'https://tiktok.com', 'Short-form video platform.', 'Technology', '10001+', 'Los Angeles, CA', 'Private', 2016, ARRAY['Social', 'Video']),
(gen_random_uuid(), 'Zoom', 'https://logo.clearbit.com/zoom.us', 'https://zoom.us', 'Video communications platform.', 'Technology', '5001-10000', 'San Jose, CA', 'Public', 2011, ARRAY['Video', 'Communication']),
(gen_random_uuid(), 'DocuSign', 'https://logo.clearbit.com/docusign.com', 'https://docusign.com', 'Electronic signature platform.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2003, ARRAY['Legal', 'E-signature']),
(gen_random_uuid(), 'Box', 'https://logo.clearbit.com/box.com', 'https://box.com', 'Cloud content management.', 'Technology', '1001-5000', 'Redwood City, CA', 'Public', 2005, ARRAY['Storage', 'Collaboration']),
(gen_random_uuid(), 'Zendesk', 'https://logo.clearbit.com/zendesk.com', 'https://zendesk.com', 'Customer service software.', 'Technology', '5001-10000', 'San Francisco, CA', 'Public', 2007, ARRAY['Support', 'CRM']),
(gen_random_uuid(), 'HubSpot', 'https://logo.clearbit.com/hubspot.com', 'https://hubspot.com', 'Inbound marketing and sales platform.', 'Technology', '5001-10000', 'Cambridge, MA', 'Public', 2006, ARRAY['Marketing', 'CRM']),
(gen_random_uuid(), 'Salesforce', 'https://logo.clearbit.com/salesforce.com', 'https://salesforce.com', 'Customer relationship management.', 'Technology', '10001+', 'San Francisco, CA', 'Public', 1999, ARRAY['CRM', 'Enterprise']),
(gen_random_uuid(), 'Intercom', 'https://logo.clearbit.com/intercom.com', 'https://intercom.com', 'Customer messaging platform.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2011, ARRAY['Support', 'Messaging']),
(gen_random_uuid(), 'Freshworks', 'https://logo.clearbit.com/freshworks.com', 'https://freshworks.com', 'Customer engagement software.', 'Technology', '5001-10000', 'San Mateo, CA', 'Public', 2010, ARRAY['Support', 'CRM']),
(gen_random_uuid(), 'Gong', 'https://logo.clearbit.com/gong.io', 'https://gong.io', 'Revenue intelligence platform.', 'Technology', '1001-5000', 'San Francisco, CA', 'Private', 2015, ARRAY['Sales', 'AI']),
(gen_random_uuid(), 'Outreach', 'https://logo.clearbit.com/outreach.io', 'https://outreach.io', 'Sales execution platform.', 'Technology', '501-1000', 'Seattle, WA', 'Private', 2014, ARRAY['Sales', 'Outbound']),
(gen_random_uuid(), 'Gusto', 'https://logo.clearbit.com/gusto.com', 'https://gusto.com', 'Payroll and HR platform.', 'Technology', '1001-5000', 'San Francisco, CA', 'Public', 2011, ARRAY['HR', 'Payroll']),
(gen_random_uuid(), 'Rippling', 'https://logo.clearbit.com/rippling.com', 'https://rippling.com', 'HR and IT management platform.', 'Technology', '1001-5000', 'San Francisco, CA', 'Private', 2016, ARRAY['HR', 'IT']),
(gen_random_uuid(), 'Deel', 'https://logo.clearbit.com/deel.com', 'https://deel.com', 'Global payroll and compliance.', 'Technology', '1001-5000', 'San Francisco, CA', 'Private', 2019, ARRAY['HR', 'Remote']),
(gen_random_uuid(), 'Remote', 'https://logo.clearbit.com/remote.com', 'https://remote.com', 'Global HR platform for distributed teams.', 'Technology', '501-1000', 'Amsterdam, Netherlands', 'Private', 2019, ARRAY['HR', 'Remote']),
(gen_random_uuid(), 'Oyster', 'https://logo.clearbit.com/oysterhr.com', 'https://oysterhr.com', 'Global employment platform.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2020, ARRAY['HR', 'Remote']),
(gen_random_uuid(), 'Lattice', 'https://logo.clearbit.com/lattice.com', 'https://lattice.com', 'People management platform.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2015, ARRAY['HR', 'Performance']),
(gen_random_uuid(), 'Culture Amp', 'https://logo.clearbit.com/cultureamp.com', 'https://cultureamp.com', 'Employee experience platform.', 'Technology', '501-1000', 'Melbourne, Australia', 'Private', 2011, ARRAY['HR', 'Engagement']),
(gen_random_uuid(), 'Calendly', 'https://logo.clearbit.com/calendly.com', 'https://calendly.com', 'Scheduling automation platform.', 'Technology', '501-1000', 'Atlanta, GA', 'Private', 2013, ARRAY['Productivity', 'Scheduling']),
(gen_random_uuid(), 'Notion Labs', 'https://logo.clearbit.com/notion.so', 'https://notion.so', 'All-in-one workspace.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2016, ARRAY['Productivity', 'Collaboration']),
(gen_random_uuid(), 'Grammarly', 'https://logo.clearbit.com/grammarly.com', 'https://grammarly.com', 'AI writing assistant.', 'Technology', '501-1000', 'San Francisco, CA', 'Private', 2009, ARRAY['AI', 'Writing']),
(gen_random_uuid(), 'Duolingo', 'https://logo.clearbit.com/duolingo.com', 'https://duolingo.com', 'Language learning platform.', 'Education', '501-1000', 'Pittsburgh, PA', 'Public', 2011, ARRAY['Education', 'Gamification']),
(gen_random_uuid(), 'Coursera', 'https://logo.clearbit.com/coursera.org', 'https://coursera.org', 'Online learning platform.', 'Education', '1001-5000', 'Mountain View, CA', 'Public', 2012, ARRAY['Education', 'MOOCs']),
(gen_random_uuid(), 'Udemy', 'https://logo.clearbit.com/udemy.com', 'https://udemy.com', 'Online learning marketplace.', 'Education', '1001-5000', 'San Francisco, CA', 'Public', 2010, ARRAY['Education', 'Courses']),
(gen_random_uuid(), 'Khan Academy', 'https://logo.clearbit.com/khanacademy.org', 'https://khanacademy.org', 'Free online education platform.', 'Education', '201-500', 'Mountain View, CA', 'Nonprofit', 2008, ARRAY['Education', 'Nonprofit']),
(gen_random_uuid(), 'Masterclass', 'https://logo.clearbit.com/masterclass.com', 'https://masterclass.com', 'Online classes from experts.', 'Education', '201-500', 'San Francisco, CA', 'Private', 2015, ARRAY['Education', 'Video']),
(gen_random_uuid(), 'Chegg', 'https://logo.clearbit.com/chegg.com', 'https://chegg.com', 'Student services platform.', 'Education', '5001-10000', 'Santa Clara, CA', 'Public', 2005, ARRAY['Education', 'Homework']),
(gen_random_uuid(), 'Instacart', 'https://logo.clearbit.com/instacart.com', 'https://instacart.com', 'Grocery delivery platform.', 'Logistics', '5001-10000', 'San Francisco, CA', 'Public', 2012, ARRAY['Delivery', 'Grocery']);

-- Phase 2: Insert 150+ jobs (linked to companies, ~22 posted in last 7 days for "New Jobs")
WITH pos_arr AS (SELECT ARRAY[
  'Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Principal Engineer',
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'DevOps Engineer',
  'Data Engineer', 'ML Engineer', 'Security Engineer', 'Mobile Engineer',
  'Product Manager', 'Senior Product Manager', 'Technical Product Manager',
  'Product Designer', 'UX Designer', 'UI Designer', 'Design Manager',
  'Data Scientist', 'Analytics Engineer', 'Business Analyst',
  'Sales Engineer', 'Solutions Architect', 'Customer Success Manager',
  'Marketing Manager', 'Growth Engineer', 'Content Writer', 'Technical Writer'
] AS arr),
loc_arr AS (SELECT ARRAY[
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
  'Denver, CO', 'Chicago, IL', 'Los Angeles, CA', 'Remote', 'London, UK',
  'Berlin, Germany', 'Amsterdam, Netherlands', 'Paris, France', 'Toronto, Canada',
  'Sydney, Australia', 'Singapore', 'Dublin, Ireland', 'Madrid, Spain'
] AS arr),
emp_arr AS (SELECT ARRAY['Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contract', 'Internship'] AS arr),
numbered_companies AS (
  SELECT id, name, logo_url, row_number() OVER (ORDER BY id) - 1 AS rn FROM companies
),
company_cnt AS (SELECT count(*)::int AS n FROM companies),
job_rows AS (
  SELECT
    (SELECT id FROM numbered_companies WHERE rn = (i - 1) % (SELECT n FROM company_cnt) LIMIT 1) AS company_id,
    (SELECT name FROM numbered_companies WHERE rn = (i - 1) % (SELECT n FROM company_cnt) LIMIT 1) AS company_name,
    (SELECT logo_url FROM numbered_companies WHERE rn = (i - 1) % (SELECT n FROM company_cnt) LIMIT 1) AS company_logo_url,
    (SELECT arr[1 + (i % 28)] FROM pos_arr) AS position_title,
    (SELECT arr[1 + (i % 18)] FROM loc_arr) AS location,
    (SELECT arr[1 + (i % 6)] FROM emp_arr) AS employment_type,
    60000 + (i * 791 % 90000) AS salary_min,
    60000 + (i * 791 % 90000) + 15000 + (i * 311 % 20000) AS salary_max,
    CASE WHEN i <= 22 THEN CURRENT_TIMESTAMP - (i % 7) * INTERVAL '1 day'
         ELSE CURRENT_TIMESTAMP - (30 + (i % 60)) * INTERVAL '1 day' END AS posted_at
  FROM generate_series(1, 155) i
)
INSERT INTO jobs (company_id, company_name, company_logo_url, position_title, location, employment_type, salary_min, salary_max, salary_currency, salary_period, description, posted_at)
SELECT company_id, company_name, company_logo_url, position_title, location, employment_type,
  salary_min, salary_max, 'USD', 'Yearly',
  '## The Role
2-3 sentences on what this role is about and who you''re looking for.

## What You''ll Do
• Key responsibility 1
• Key responsibility 2
• Key responsibility 3

## What We''re Looking For
• Must-have 1 (e.g. 5+ years experience)
• Must-have 2
• Nice-to-have

## Why Join
• Benefit 1
• Benefit 2

## Eligibility
Location, visa, or work authorization requirements.',
  posted_at
FROM job_rows;

-- Phase 3: Generate 150 user IDs and create 150+ resumes
WITH user_ids AS (
  SELECT gen_random_uuid() AS user_id FROM generate_series(1, 150)
),
resume_rows AS (
  SELECT
    (SELECT user_id FROM user_ids OFFSET (i - 1) LIMIT 1) AS user_id,
    'Resume ' || (i % 5 + 1) || ' - Professional Profile' AS title,
    jsonb_build_object('skills', ARRAY['Python', 'JavaScript', 'SQL', 'React', 'Node.js'], 'experience_years', 2 + (i % 10)) AS content
  FROM generate_series(1, 150) i
)
INSERT INTO resumes (user_id, title, content)
SELECT user_id, title, content FROM resume_rows;

-- Phase 4: Insert 200+ applications (users to jobs)
INSERT INTO applications (job_id, user_id, status, applied_at)
SELECT job_id, user_id, status, applied_at FROM (
  SELECT DISTINCT ON (j.id, r.user_id)
    j.id AS job_id, r.user_id,
    'applied' AS status,
    CURRENT_TIMESTAMP - (random() * INTERVAL '60 days') AS applied_at
  FROM jobs j
  CROSS JOIN resumes r
  ORDER BY j.id, r.user_id, random()
) sub
LIMIT 210;

-- Phase 5: Insert 150+ suggested_jobs (users to jobs with match_score)
INSERT INTO suggested_jobs (user_id, job_id, match_score)
SELECT r.user_id, j.id, 0.5 + (random() * 0.5)
FROM resumes r
CROSS JOIN jobs j
ORDER BY random()
LIMIT 160;
