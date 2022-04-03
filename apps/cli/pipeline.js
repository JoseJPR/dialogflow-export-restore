import path from 'path';
import enquire from 'enquirer';

export default class Pipeline {
  constructor({
    dialogflowIntegrator,
    orchestratorBucketUri,
    environmentConfiguration,
  }) {
    this.dialogflowIntegrator = dialogflowIntegrator;
    this.orchestatorProjectId = dialogflowIntegrator.storage.projectId;
    this.orchestratorBucketUri = orchestratorBucketUri;
    this.environmentConfiguration = environmentConfiguration;
    this.environmentList = Array.from(environmentConfiguration.keys());
  }

  async ui() {
    const {
      environmentToExport,
      environmentToRestore,
    } = await enquire.prompt([{
      type: 'select',
      name: 'environmentToExport',
      message: 'Select the environment to export',
      choices: this.environmentList,
    },
    {
      type: 'select',
      name: 'environmentToRestore',
      message: 'Select the environment to restore',
      choices: this.environmentList,
    }]);
    this.environmentToExport = environmentToExport;
    this.environmentToRestore = environmentToRestore;
  }

  async exec() {
    const fileName = this.dialogflowIntegrator.generateFileName();

    // Export and download the origin DF Agent in order to create a backup version
    await this.dialogflowIntegrator
      .exportAgent({
        agentId: this.environmentConfiguration.get(this.environmentToExport).agentId,
        agentLocation: this.environmentConfiguration.get(this.environmentToExport).agentLocation,
        backupUri: `${this.orchestratorBucketUri}/${this.environmentConfiguration.get(this.environmentToExport).prefixBackupName}-${fileName}.zip`,
      });
    await this.dialogflowIntegrator
      .downloadBackup({
        backupUri: `${this.orchestratorBucketUri}/${this.environmentConfiguration.get(this.environmentToExport).prefixBackupName}-${fileName}.zip`,
        destinationPath: path.resolve(`./agents/${this.environmentConfiguration.get(this.environmentToExport).prefixBackupName}-${fileName}.zip`),
      });
    await this.dialogflowIntegrator
      .uncompressBackupFile({
        originFilePath: path.resolve(`./agents/${this.environmentConfiguration.get(this.environmentToExport).prefixBackupName}-${fileName}.zip`),
        destinationDirPath: path.resolve(`./agents/${this.environmentConfiguration.get(this.environmentToExport).prefixBackupName}-${fileName}`),
      });

    // Export and download the destination DF Agent in order to create a backup version
    await this.dialogflowIntegrator
      .exportAgent({
        agentId: this.environmentConfiguration.get(this.environmentToRestore).agentId,
        agentLocation: this.environmentConfiguration.get(this.environmentToRestore).agentLocation,
        backupUri: `${this.orchestratorBucketUri}/${this.environmentConfiguration.get(this.environmentToRestore).prefixBackupName}-${fileName}.zip`,
      });
    await this.dialogflowIntegrator
      .downloadBackup({
        backupUri: `${this.orchestratorBucketUri}/${this.environmentConfiguration.get(this.environmentToRestore).prefixBackupName}-${fileName}.zip`,
        destinationPath: path.resolve(`./agents/${this.environmentConfiguration.get(this.environmentToRestore).prefixBackupName}-${fileName}.zip`),
      });
    await this.dialogflowIntegrator
      .uncompressBackupFile({
        originFilePath: path.resolve(`./agents/${this.environmentConfiguration.get(this.environmentToRestore).prefixBackupName}-${fileName}.zip`),
        destinationDirPath: path.resolve(`./agents/${this.environmentConfiguration.get(this.environmentToRestore).prefixBackupName}-${fileName}`),
      });

    // Restore the origin DF agent version into the destination DF agent.
    await this.dialogflowIntegrator
      .restoreAgent({
        agentId: this.environmentConfiguration.get(this.environmentToRestore).agentId,
        agentLocation: this.environmentConfiguration.get(this.environmentToRestore).agentLocation,
        backupUri: `${this.orchestratorBucketUri}/${this.environmentConfiguration.get(this.environmentToExport).prefixBackupName}-${fileName}.zip`,
      });
  }
}
