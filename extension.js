import * as vscode from "vscode";
import { findTemplateLinks } from "./links.js";

/**
 * Resolves a template path found in a document to an absolute file URI.
 *
 * Relative paths are resolved against the directory of the current file,
 * while paths starting with `/` are resolved against the workspace root,
 * mirroring how the Vento engine resolves includes and layouts.
 *
 * @param {vscode.Uri} uri The URI of the document containing the link.
 * @param {string} rawPath The raw path as written in the template.
 * @returns {vscode.Uri} The absolute target URI.
 */
function resolveTarget(uri, rawPath) {
  let path;
  try {
    path = decodeURI(rawPath);
  } catch {
    path = rawPath;
  }
  if (path.startsWith("/")) {
    const root = vscode.workspace.getWorkspaceFolder(uri);
    return vscode.Uri.joinPath(root ? root.uri : uri.with({ path: "/" }), path);
  }
  return vscode.Uri.joinPath(uri, "..", path);
}

/**
 * Provides clickable links for template paths in `.vto` / `.vento` files.
 */
class VentoLinkProvider {
  /**
   * Scans the document for template paths and converts them to document links.
   *
   * @param {vscode.TextDocument} document The document to scan.
   * @returns {vscode.DocumentLink[]} The links found in the document.
   */
  provideDocumentLinks(document) {
    const text = document.getText();

    return findTemplateLinks(text).map(({ path, start, end }) => {
      const range = new vscode.Range(
        document.positionAt(start),
        document.positionAt(end)
      );
      const link = new vscode.DocumentLink(range, resolveTarget(document.uri, path));
      link.tooltip = `Open ${path}`;
      return link;
    });
  }
}

/**
 * Extension entry point. Registers the document link provider for Vento files.
 *
 * @param {vscode.ExtensionContext} context The extension context.
 */
export function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { language: "vento" },
      new VentoLinkProvider()
    )
  );
}

/**
 * Extension teardown point. Nothing to clean up: the provider is disposed
 * automatically through `context.subscriptions`.
 */
export function deactivate() {}
