process.env.NODE_ENV = "test";
const { expect } = require("chai");
const { generateEmail } = require("../emailGenerator/index.js");
const { getMpByPostcode } = require("../api-calls");
const fs = require("fs");

const negativeResult = require("./mockTypeformResponses/NegativeResult.json");
const allToryResult = require("./mockTypeformResponses/AllTory.json");
const jewishResponse = require("./exampleTypeformResponses/Jewish.json");
const otherReligionResponse = require("./exampleTypeformResponses/OtherReligion.json");
const nonToryResponse = require("./exampleTypeformResponses/NotTory.json");
const labourMpResponse = require("./exampleTypeformResponses/LabourMP.json");
const nonValidPostcodeResponse = require("./exampleTypeformResponses/NonValidPostcode.json");

const { motivationHandler } = require("../emailGenerator/responseHandlers.js");
const { questionKeys } = require("../emailGenerator/keys.js");

const mockTypeformResponses = [];
var normalizedPath = require("path").join(__dirname, "mockTypeformResponses");

fs.readdirSync(normalizedPath).forEach(function (file) {
  mockTypeformResponses.push({
    filename: file,
    json: require("./mockTypeformResponses/" + file),
  });
});

const getRandomEmail = () => {
  const randomIndex = Math.floor(Math.random() * mockTypeformResponses.length);
  const randomResponse = mockTypeformResponses[randomIndex];
  return generateEmail(randomResponse.json.form_response);
};

describe("/api/postcode", () => {
  it("should return expected MP details for DL6 2NJ", async () => {
    result = await getMpByPostcode("DL6 2NJ");
    expect(result.full_name).to.equal("Rishi Sunak");
    expect(result.constituency).to.equal("Richmond (Yorks)");
    expect(result.party).to.equal("Conservative");
    expect(result.mpEmailAddress).to.equal("rishi.sunak.mp@parliament.uk");
  });
  it("should return expected MP details for s6 2PN", async () => {
    result = await getMpByPostcode("s6 2pn");
    expect(result.full_name).to.equal("Paul Blomfield");
    expect(result.constituency).to.equal("Sheffield Central");
    expect(result.party).to.equal("Labour");
    expect(result.mpEmailAddress).to.equal("paul.blomfield.mp@parliament.uk");
  });
  it("should correctly handle errors for an invalid postcode", async () => {
    result = await getMpByPostcode("marmite");
    expect(result.error).to.equal("Could not retrieve MP");
    secondResult = await getMpByPostcode("S62 2PB");
    expect(secondResult.error).to.equal("Could not retrieve MP");
  });
  it("should return the 2021 current MP", async () => {
    result = await getMpByPostcode("EH39 4PS");
    expect(result.full_name).to.equal("Kenny MacAskill");
    expect(result.full_name).to.not.equal("George Kerevan");
    secondResult = await getMpByPostcode("M54YD");
    expect(secondResult.full_name).to.equal("Rebecca Long Bailey");
    expect(secondResult.full_name).to.not.equal("Hazel Blears");
  });
});

describe("emailGeneratorFuncs", () => {
  let covidResponse;
  before(async function () {
    let {
      answers,
      definition: { fields },
    } = nonToryMpCovidResponse.form_response;
    covidResponse = await motivationHandler(
      questionKeys.motivation,
      fields,
      answers
    );
  });
  it("should return synonyms for a 'Covid' motivations choice", () => {
    const regex = /covid|pandemic|poverty/gi;
    expect(regex.test(covidResponse)).to.be.true;
  });
  before(async function () {
    let {
      answers,
      definition: { fields },
    } = nonValidPostcodeBritainSecurityResearchResponse.form_response;
    researchResponse = await motivationHandler(
      questionKeys.motivation,
      fields,
      answers
    );
  });
  it("should return synonyms for a 'research' motivations choice", () => {
    const regex = /research/gi;
    expect(regex.test(researchResponse)).to.be.true;
  });
  before(async function () {
    let {
      answers,
      definition: { fields },
    } = allToryResult.form_response;
    yemenResponse = await motivationHandler(
      questionKeys.motivation,
      fields,
      answers
    );
  });
  it("should return synonyms for a 'Yemen' motivations choice", () => {
    const regex = /yemen/gi;
    expect(regex.test(yemenResponse)).to.be.true;
  });
});

describe("generateEmail", () => {
  let randomResponse;
  let negativeEmail;
  let allToryEmail;
  let labourMpEmail;
  let nonToryEmail;
  let jewishEmail;
  let otherReligionEmail;
  let nonValidPostcodeEmail;
  let covidMotivationsEmail;
  let nonValidPostcodeEmail;

  before(async function () {
    randomResponse = await getRandomEmail();
    negativeEmail = await generateEmail(negativeResult.form_response);
    allToryEmail = await generateEmail(allToryResult.form_response);
    labourMpEmail = await generateEmail(labourMpResponse.form_response);
    nonToryEmail = await generateEmail(nonToryResponse.form_response);
    jewishEmail = await generateEmail(jewishResponse.form_response);
    otherReligionEmail = await generateEmail(
      otherReligionResponse.form_response
    );
    nonValidPostcodeEmail = await generateEmail(
      nonValidPostcodeResponse.form_response
    );
  });
  it("should return an object with keys 'body' and 'subject'", () => {
    expect(randomResponse).to.have.keys(
      "body",
      "subject",
      "greeting",
      "mpData",
      "supportEquity"
    );
    expect(Object.keys(randomResponse).length).to.equal(5);
  });
  it("response.body should be a string", () => {
    expect(typeof randomResponse.body).to.equal("string");
  });
  it("response.subject should be a string", () => {
    expect(typeof randomResponse.subject).to.equal("string");
  });
  it("should not include 'COUNTRY_NAME' template variable", () => {
    expect(randomResponse.body.search("COUNTRY_NAME")).to.equal(-1);
  });
  it("should not include the string 'undefined' anywhere in the email", () => {
    expect(randomResponse.body.search("undefined")).to.equal(-1);
  });
  it("should not include 'RELIGIOUS_DENONYM_NOUN' or 'RELIGIOUS_DENONYM_ADJ' template variable", () => {
    expect(jewishEmail.body.search(/RELIGIOUS_DENONYM_NOUN/gi)).to.equal(-1);
    expect(jewishEmail.body.search(/RELIGIOUS_DEMONYM_NOUN/gi)).to.equal(-1);
    expect(jewishEmail.body.search(/RELIGIOUS_DENONYM_ADJ/gi)).to.equal(-1);
    expect(jewishEmail.body.search(/RELIGIOUS_DEMONYM_ADJ/gi)).to.equal(-1);
    expect(otherReligionEmail.body.search(/RELIGIOUS_DENONYM_NOUN/gi)).to.equal(
      -1
    );
    expect(otherReligionEmail.body.search(/RELIGIOUS_DEMONYM_NOUN/gi)).to.equal(
      -1
    );
    expect(otherReligionEmail.body.search(/RELIGIOUS_DENONYM_ADJ/gi)).to.equal(
      -1
    );
    expect(otherReligionEmail.body.search(/RELIGIOUS_DEMONYM_ADJ/gi)).to.equal(
      -1
    );
  });
  it("should include references to a user's religion when a user has one", () => {
    expect([
      jewishEmail.body.search(/Jew/gi),
      jewishEmail.body.search(/Jewish/gi),
    ]).to.not.eql([-1, -1]);
    expect([
      otherReligionEmail.body.search(/religious/gi),
      otherReligionEmail.body.search(/person of faith/gi),
    ]).to.not.eql([-1, -1]);
  });
  it("should not include a response for 'no religion' choice", () => {
    expect(randomResponse.body.search(/Not religious/)).to.equal(-1);
    expect(randomResponse.body.search(/agnostic/)).to.equal(-1);
    expect(randomResponse.body.search(/athiest/)).to.equal(-1);
  });
  it("should not include a response for 'other religion' choice", () => {
    expect(randomResponse.body.search(/Not religious/)).to.equal(-1);
    expect(randomResponse.body.search(/agnostic/)).to.equal(-1);
    expect(randomResponse.body.search(/athiest/)).to.equal(-1);
  });
  it("should not include escaped 'newline' characters", () => {
    expect(randomResponse.body).not.to.contain("\\n");
  });
  it("negative responses to question 1 (supporting equity) should return a blank", () => {
    expect(negativeEmail.body).to.equal("");
    expect(negativeEmail.subject).to.equal("");
  });
  it("non-conservative responses should not reference that in the email", () => {
    expect(nonToryEmail.body.search(/member/gi)).to.equal(-1);
  });
  it("Conservative responses to Conservative MPs should reference that in the email", () => {
    expect(allToryEmail.body.search(/conservative/gi)).to.not.equal(-1);
  });
  it("works even if a user inputs an invalid postcode", () => {
    expect(nonValidPostcodeEmail).to.have.keys(
      "body",
      "subject",
      "greeting",
      "mpData",
      "supportsAid"
    );
  });
  it("should include reference to a user's motivation where they have put that in", () => {
    const regex = /covid|pandemic|poverty/gi;
    expect(regex.test(covidMotivationsEmail.body)).to.be.true;
  });
});
