import z from "zod";
import { EndpointConfig } from "../src/types/endpointConfig";

const PersonCategory = z.enum([
  "historical",
  "celebrity",
  "politician",
  "scientist",
  "artist",
  "other",
]);

// Define the main person schema
const PersonSchema = z.object({
  name: z.object({
    full: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  birthDate: z.date(),
  deathDate: z.date().optional(),
  nationality: z.string().optional(),
  occupation: z.array(z.string()).min(1),
  category: PersonCategory,
  knownFor: z.array(z.string()),
  briefBio: z.string().max(500),
  imageUrl: z.string().url(),
  sources: z.array(z.string().url()),
  lastUpdated: z.date().default(() => new Date()),
});

export default PersonSchema;

export const config: EndpointConfig = {
  /** path to the endpoint. one word, no special characters */
  path: "person",
  /**
   * determines if the endpoint is available for public access
   * users must use their own OpenAI API key
   */
  public: false,
  /** name of the endpoint */
  name: "Person",
  /** description of the endpoint */
  description: "A person in history or the present day",
};
