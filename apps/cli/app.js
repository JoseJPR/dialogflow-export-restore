import dotenv from 'dotenv';
import ora from 'ora';
import DialogflowIntegrator from '../../src/tools/dialogflow-integrator.js';
import Pipeline from './pipeline.js';
import message from './message.js';
import {
  ORCHESTATOR_PROJECT_ID,
  ORCHESTATOR_BUCKET_URI,
  ENVIRONMENTS_CONFIGURATION,
} from '../../src/config/gcp.js';

(async () => {
  try {
    // Clear the terminal and read the environment variables.
    message.clear()
    dotenv.config();
    // Define Dialogflow Integration object.
    const dialogflowIntegrator = new DialogflowIntegrator({
      orchestatorProjectId: ORCHESTATOR_PROJECT_ID,
      orchestratorBucketUri: ORCHESTATOR_BUCKET_URI,
      clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
    });
    // Define Pipeline with Dialogflow Integration Injection and execute the UI.
    const pipeline = new Pipeline({
      dialogflowIntegrator,
      orchestratorBucketUri: ORCHESTATOR_BUCKET_URI,
      environmentConfiguration: ENVIRONMENTS_CONFIGURATION,
    });
    await pipeline.ui();
    const spinner = ora('Executing pipeline....').start();
    await pipeline.exec();
    spinner.stop();
    message.info('The task has finished successfully.');
  } catch (err) {
    message.error(err);
    process.exit(1);
  }
})();
