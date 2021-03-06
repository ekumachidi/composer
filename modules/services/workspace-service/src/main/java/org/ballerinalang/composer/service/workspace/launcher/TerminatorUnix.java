/*
 * Copyright (c) 2017, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.ballerinalang.composer.service.workspace.launcher;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.Charset;

/**
 * Launcher Terminator Implementation for Unix.
 */
public class TerminatorUnix implements Terminator {
    private Command command;
    private static final Logger logger = LoggerFactory.getLogger(TerminatorUnix.class);

    TerminatorUnix(Command command) {
        this.command = command;
    }

    /**
     *
     * @param script absolute path of ballerina file running
     * @return find process command
     */
    private String[] getFindProcessCommand(String script) {
        String[] cmd = {
                "/bin/sh",
                "-c",
                "ps -ef | grep " + script + " | grep run | grep ballerina | grep -v 'grep' | awk '{print $2}'"
        };
        return cmd;
    }

    /**
     * Terminate running ballerina program
     */
    public void terminate() {
        String cmd = command.getCommandIdentifier();
        int processID = -1;
        String[] findProcessCommand = getFindProcessCommand(cmd);
        BufferedReader reader = null;
        try {
            Process findProcess = Runtime.getRuntime().exec(findProcessCommand);
            findProcess.waitFor();
            reader = new BufferedReader(new InputStreamReader(findProcess.getInputStream(), Charset.defaultCharset()));

            String line = "";
            while ((line = reader.readLine()) != null) {
                try {
                    processID = Integer.parseInt(line);
                    kill(processID);
                } catch (Throwable e) {
                }
            }
        } catch (Throwable e) {
            logger.error("Launcher was unable to find the process ID for " + cmd + ".");
        } finally {
            if (reader != null) {
                IOUtils.closeQuietly(reader);
            }
        }
    }

    /**
     * Terminate running ballerina program
     * @param pid
     */
    public void kill(int pid) {
        //todo need to put aditional validation
        if (pid < 0) {
            return;
        }
        String killCommand = String.format("kill -9 %d", pid);
        BufferedReader reader = null;
        try {
            Process kill = Runtime.getRuntime().exec(killCommand);
            kill.waitFor();
            reader = new BufferedReader(new InputStreamReader(kill.getInputStream(), Charset.defaultCharset()));

            String line = "";
            while ((line = reader.readLine()) != null) {
                System.out.print(line);
            }
        } catch (Throwable e) {
            logger.error("Launcher was unable to terminate process:" + pid + ".");
        } finally {
            if (reader != null) {
                IOUtils.closeQuietly(reader);
            }
        }
    }

}
