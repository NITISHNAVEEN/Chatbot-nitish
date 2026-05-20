# **App Name**: LinkThread

## Core Features:

- Centralized Admin Dashboard: An interface for admins to manage multiple chatbots, define topics, and track performance across different URLs.
- Rule Book Configuration: System for setting a 'Master Rule Book' or creating specific behavior custom regulations for individual bot instances.
- Resource Knowledge Base: Integration of Firestore to store and query extracted PDF text, web links, and custom text inputs.
- Dynamic Share Link Engine: Generates unique, deployable links for each chatbot instance that can be used independently on any web page.
- Intelligent RAG Tool: An AI powered tool that decides when to use fixed training data versus searching resources in the Firestore database to generate a response.
- Custom Training Modality: Tool for admins to manually map fixed bot responses to fixed user prompts to create a specific conversational flow.
- Production-Ready Chat Interface: A lightweight, user-friendly frontend optimized for cross-browser embedding via the generated link.

## Style Guidelines:

- Primary color: Electric Violet (#9d59f2) to represent modern technology and structured flow.
- Background color: Deep Charcoal with a hint of purple (#121014) to provide a premium, high-contrast dark scheme.
- Accent color: Celestial Blue (#6e7dfc) for call-to-action elements and interaction highlights.
- Headline font: 'Space Grotesk' (sans-serif) for a precise, techy feel in admin menus. Body font: 'Inter' (sans-serif) for high legibility in the chat windows.
- Code font: 'Source Code Pro' (monospace) for inputting rules and managing database paths.
- Clean, split-view admin layout showing configurations on the left and a live-updating bot preview on the right.
- Smooth fade-in transitions for chat bubbles and pulse indicators for AI thinking states.