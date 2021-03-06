/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import _ from 'lodash';
import AbstractSourceGenVisitor from './abstract-source-gen-visitor';
import StatementVisitorFactory from './statement-visitor-factory';
import ConnectorDeclarationVisitor from './connector-declaration-visitor';
import WorkerDeclarationVisitor from './worker-declaration-visitor';

/**
 * @param parent
 * @constructor
 */
class ResourceDefinitionVisitor extends AbstractSourceGenVisitor {

    canVisitResourceDefinition() {
        return true;
    }

    beginVisitResourceDefinition(resourceDefinition) {
        /**
         * set the configuration start for the resource definition language construct
         * If we need to add additional parameters which are dynamically added to the configuration start
         * that particular source generation has to be constructed here
         */
        const useDefaultWS = resourceDefinition.whiteSpace.useDefault;
        if (useDefaultWS) {
            this.currentPrecedingIndentation = this.getCurrentPrecedingIndentation();
            this.replaceCurrentPrecedingIndentation('\n' + this.getIndentation());
        }
        let constructedSourceSegment = '';
        _.forEach(resourceDefinition.getChildrenOfType(resourceDefinition.getFactory().isAnnotation),
            (annotationNode) => {
                if (annotationNode.isSupported()) {
                    constructedSourceSegment += annotationNode.toString()
                        + ((annotationNode.whiteSpace.useDefault) ? this.getIndentation() : '');
                }
            });

        constructedSourceSegment += 'resource' + resourceDefinition.getWSRegion(0)
                  + resourceDefinition.getResourceName()
                  + resourceDefinition.getWSRegion(1)
                  + '(';

        constructedSourceSegment += resourceDefinition.getParametersAsString()
                + ')' + resourceDefinition.getWSRegion(3)
                + '{' + resourceDefinition.getWSRegion(4);
        this.appendSource(constructedSourceSegment);
        this.appendSource((useDefaultWS) ? this.getIndentation() : '');
        this.indent();
    }

    visitResourceDefinition() {
    }

    visitStatement(statement) {
        const statementVisitorFactory = new StatementVisitorFactory();
        const statementVisitor = statementVisitorFactory.getStatementVisitor(statement, this);
        statement.accept(statementVisitor);
    }

    visitConnectorDeclaration(connectorDeclaration) {
        const connectorDeclarationVisitor = new ConnectorDeclarationVisitor(this);
        connectorDeclaration.accept(connectorDeclarationVisitor);
    }

    visitWorkerDeclaration(workerDeclaration) {
        const workerDeclarationVisitor = new WorkerDeclarationVisitor(this);
        workerDeclaration.accept(workerDeclarationVisitor);
    }

    endVisitResourceDefinition(resourceDefinition) {
        this.outdent();
        this.appendSource('}' + resourceDefinition.getWSRegion(5));
        this.appendSource((resourceDefinition.whiteSpace.useDefault) ?
                      this.currentPrecedingIndentation : '');
        this.getParent().appendSource(this.getGeneratedSource());
    }
}

export default ResourceDefinitionVisitor;
