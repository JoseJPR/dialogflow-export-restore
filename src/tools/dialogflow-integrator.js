import dialogflow from '@google-cloud/dialogflow';
import { Storage } from '@google-cloud/storage';
import extract from 'extract-zip';
import { v4 as uuidv4 } from 'uuid';

export default class DialogflowIntegrator {
  #extract = extract;

  constructor({
    orchestatorProjectId,
    orchestratorBucketUri,
    clientEmail,
    privateKey,
  }) {
    const credentials = {
      client_email: clientEmail,
      private_key: privateKey,
    };
    this.agent = new dialogflow.AgentsClient({
      credentials,
    });
    this.storage = new Storage({
      projectId: orchestatorProjectId,
      credentials,
    });
    this.orchestratorBucketUri = orchestratorBucketUri;
    this.generateFileName = uuidv4;
  }

  async exportAgent({
    agentId,
    agentLocation,
    backupUri,
  }) {
    const [operation] = await this.agent.exportAgent({
      parent: `projects/${agentId}/locations/${agentLocation}`,
      agentUri: backupUri,
    });
    const [response] = await operation.promise();
    return response;
  }

  async restoreAgent({
    agentId,
    agentLocation,
    backupUri,
  }) {
    const request = {
      parent: `projects/${agentId}/locations/${agentLocation}`,
      agentUri: backupUri,
    };

    const [operation] = await this.agent.restoreAgent(request);
    const [response] = await operation.promise();
    return response;
  }

  async downloadBackup({
    backupUri,
    destinationPath,
  }) {
    const {
      protocol,
      hostname,
      pathname,
    } = new URL(backupUri);

    const result = await this.storage
      .bucket(`${protocol}//${hostname}`)
      .file(pathname.substring(1))
      .download({
        destination: destinationPath,
      });
    return result;
  }

  async uncompressBackupFile({
    originFilePath,
    destinationDirPath,
  }) {
    const result = await this.#extract(originFilePath, { dir: destinationDirPath });
    return result;
  }
}
