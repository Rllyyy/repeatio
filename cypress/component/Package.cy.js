/// <reference types="cypress" />
import packageJson from "../../package.json";

describe("Package.cy.js", () => {
  //Prebuild should add the property and then remove it after the electron builder, else the website will fail
  it("should not have homepage property", () => {
    expect(packageJson).not.to.have.property("homepage");
  });
});
//"homepage": "./",
