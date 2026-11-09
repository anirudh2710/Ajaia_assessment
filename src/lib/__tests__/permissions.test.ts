import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getUserDocumentRole,
  canUserViewDocument,
  canUserEditDocument,
  canUserShareDocument,
  canUserDeleteDocument,
  DocumentWithShares,
} from "../permissions";

describe("Permissions Logic", () => {
  const mockDoc: DocumentWithShares = {
    id: "doc_123",
    ownerId: "user_owner",
    shares: [
      { userId: "user_editor", role: "editor" },
      { userId: "user_viewer", role: "viewer" },
    ],
  };

  it("correctly identifies the document owner with full permissions", () => {
    assert.equal(getUserDocumentRole("user_owner", mockDoc), "owner");
    assert.equal(canUserViewDocument("user_owner", mockDoc), true);
    assert.equal(canUserEditDocument("user_owner", mockDoc), true);
    assert.equal(canUserShareDocument("user_owner", mockDoc), true);
    assert.equal(canUserDeleteDocument("user_owner", mockDoc), true);
  });

  it("grants editor view and edit rights, but blocks share/delete", () => {
    assert.equal(getUserDocumentRole("user_editor", mockDoc), "editor");
    assert.equal(canUserViewDocument("user_editor", mockDoc), true);
    assert.equal(canUserEditDocument("user_editor", mockDoc), true);
    assert.equal(canUserShareDocument("user_editor", mockDoc), false);
    assert.equal(canUserDeleteDocument("user_editor", mockDoc), false);
  });

  it("grants viewer view-only rights and blocks all mutating actions", () => {
    assert.equal(getUserDocumentRole("user_viewer", mockDoc), "viewer");
    assert.equal(canUserViewDocument("user_viewer", mockDoc), true);
    assert.equal(canUserEditDocument("user_viewer", mockDoc), false);
    assert.equal(canUserShareDocument("user_viewer", mockDoc), false);
    assert.equal(canUserDeleteDocument("user_viewer", mockDoc), false);
  });

  it("denies all access to uninvited external users", () => {
    assert.equal(getUserDocumentRole("user_stranger", mockDoc), "none");
    assert.equal(canUserViewDocument("user_stranger", mockDoc), false);
    assert.equal(canUserEditDocument("user_stranger", mockDoc), false);
    assert.equal(canUserShareDocument("user_stranger", mockDoc), false);
    assert.equal(canUserDeleteDocument("user_stranger", mockDoc), false);
  });
});
