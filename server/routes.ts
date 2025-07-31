import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTravelResponse, generateChatTitle } from "./services/openai";
import { travelService } from "./services/travel";
import { insertChatSessionSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new chat session
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const { title } = req.body;
      
      // For now, create session without user authentication
      // TODO: Add proper user authentication
      const session = await storage.createChatSession({
        userId: null,
        title: title || "New Chat"
      });
      
      // Add welcome message to new session
      const welcomeMessage = await storage.createMessage({
        sessionId: session.id,
        content: "Hello! I'm your AI travel assistant. I can help you find hotels, flights, plan itineraries, and answer any travel questions you have. Where would you like to go or what can I help you with today?",
        isUser: "false",
        metadata: null
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // Get chat sessions (for sidebar)
  app.get("/api/chat/sessions", async (req, res) => {
    try {
      // For now, get sessions without user filter
      // TODO: Filter by authenticated user
      const sessions = await storage.getChatSessionsForUser("anonymous");
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  // Get messages for a session
  app.get("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessagesForSession(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message and get AI response
  app.post("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        sessionId,
        content,
        isUser: "true",
        metadata: null
      });

      // Get chat history for context
      const existingMessages = await storage.getMessagesForSession(sessionId);
      const chatHistory = existingMessages
        .slice(-10) // Last 10 messages for context
        .map(msg => msg.content);

      // Generate AI response
      const aiResponse = await generateTravelResponse(content, chatHistory);
      
      let responseMetadata = null;
      
      // If AI suggests searching for travel options
      if (aiResponse.shouldSearchTravel && aiResponse.travelQuery) {
        try {
          const travelResults = await travelService.searchTravel(aiResponse.travelQuery);
          responseMetadata = {
            type: aiResponse.travelQuery.type,
            data: travelResults
          };
          
          // Save travel search
          await storage.createTravelSearch({
            sessionId,
            searchType: aiResponse.travelQuery.type,
            query: aiResponse.travelQuery,
            results: travelResults
          });
        } catch (travelError) {
          console.error("Travel search error:", travelError);
        }
      }

      // Save AI response
      const assistantMessage = await storage.createMessage({
        sessionId,
        content: aiResponse.message,
        isUser: "false",
        metadata: responseMetadata
      });

      // Update chat title if this is the first user message
      const messageCount = existingMessages.length;
      if (messageCount === 1) { // First user message (AI welcome message already exists)
        try {
          const title = await generateChatTitle(content);
          await storage.updateChatSessionTitle(sessionId, title);
        } catch (titleError) {
          console.error("Error generating chat title:", titleError);
        }
      }

      res.json({
        userMessage,
        assistantMessage: {
          ...assistantMessage,
          travelResults: responseMetadata
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Travel search endpoint
  app.post("/api/travel/search", async (req, res) => {
    try {
      const query = req.body;
      const results = await travelService.searchTravel(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching travel:", error);
      res.status(500).json({ error: "Failed to search travel options" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
