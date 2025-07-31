import { type User, type InsertUser, type ChatSession, type InsertChatSession, type Message, type InsertMessage, type TravelSearch, type InsertTravelSearch, type MessageWithMetadata, type ChatSessionWithMessages } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionsForUser(userId: string): Promise<ChatSessionWithMessages[]>;
  updateChatSessionTitle(id: string, title: string): Promise<ChatSession | undefined>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForSession(sessionId: string): Promise<MessageWithMetadata[]>;

  // Travel search methods
  createTravelSearch(search: InsertTravelSearch): Promise<TravelSearch>;
  getTravelSearchesForSession(sessionId: string): Promise<TravelSearch[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatSessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;
  private travelSearches: Map<string, TravelSearch>;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.messages = new Map();
    this.travelSearches = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const now = new Date();
    const session: ChatSession = {
      id,
      title: insertSession.title,
      userId: insertSession.userId || null,
      createdAt: now,
      updatedAt: now
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessionsForUser(userId: string): Promise<ChatSessionWithMessages[]> {
    const sessions = Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));

    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const messages = await this.getMessagesForSession(session.id);
        return {
          ...session,
          messages,
          messageCount: messages.length
        };
      })
    );

    return sessionsWithMessages;
  }

  async updateChatSessionTitle(id: string, title: string): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      title,
      updatedAt: new Date()
    };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      sessionId: insertMessage.sessionId,
      content: insertMessage.content,
      isUser: insertMessage.isUser,
      metadata: insertMessage.metadata || null,
      createdAt: new Date()
    };
    this.messages.set(id, message);

    // Update session updatedAt
    const session = this.chatSessions.get(insertMessage.sessionId);
    if (session) {
      this.chatSessions.set(insertMessage.sessionId, {
        ...session,
        updatedAt: new Date()
      });
    }

    return message;
  }

  async getMessagesForSession(sessionId: string): Promise<MessageWithMetadata[]> {
    const messages = Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));

    return messages.map(message => ({
      ...message,
      travelResults: message.metadata as any
    }));
  }

  async createTravelSearch(insertSearch: InsertTravelSearch): Promise<TravelSearch> {
    const id = randomUUID();
    const search: TravelSearch = {
      id,
      sessionId: insertSearch.sessionId,
      searchType: insertSearch.searchType,
      query: insertSearch.query,
      results: insertSearch.results || null,
      createdAt: new Date()
    };
    this.travelSearches.set(id, search);
    return search;
  }

  async getTravelSearchesForSession(sessionId: string): Promise<TravelSearch[]> {
    return Array.from(this.travelSearches.values())
      .filter(search => search.sessionId === sessionId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
}

export const storage = new MemStorage();
