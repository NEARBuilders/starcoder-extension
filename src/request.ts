import fetch, { FetchError, Response } from "node-fetch";
import * as vscode from "vscode";
import updatetoken from "./updatetoken";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface ResponseModel {
    generated_text: string;
}

export default async (input: string): Promise<string | null> => {
    const apiUrl = vscode.workspace.getConfiguration("starcoder").get("apiurl") as string;
    const bearerToken = process.env.BEARER_TOKEN;

    if (!bearerToken) {
        vscode.window.showErrorMessage("Bearer token is not set in the environment variables.");
        return null;
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                authorization: `Bearer ${bearerToken}`,
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ inputs: input }),
        });

        if (response.status !== 200) {
            if (response.status === 400) {
                vscode.window.showErrorMessage("Bearer invalid!");
                vscode.workspace.getConfiguration("starcoder").update("bearertoken", "", vscode.ConfigurationTarget.Global);
                updatetoken();
                return null;
            } else {
                vscode.window.showWarningMessage("Service turned off right now. Try later!");
                return null;
            }
        }

        const jsonResponse: ResponseModel[] = await response.json() as ResponseModel[];
        const output = jsonResponse[0].generated_text;
        console.log(`Output: ${output.length}`);
        return output;

    } catch (exception: any) {
        if (exception instanceof FetchError) {
            vscode.window.showErrorMessage(exception.message);
        }
        return null;
    }
};