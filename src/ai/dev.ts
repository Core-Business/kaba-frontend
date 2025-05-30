
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-introduction.ts';
import '@/ai/flows/define-scope.ts';
import '@/ai/flows/enhance-text.ts';
import '@/ai/flows/generate-objective.ts';
import '@/ai/flows/generate-activity-name.ts'; // Added new flow
