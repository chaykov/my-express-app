const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const should = chai.should();

chai.use(chaiHttp);

describe("Users", () => {
  describe("/POST register", () => {
    it("it should register a user", (done) => {
      let user = {
        username: "testuser",
        password: "password123",
      };
      chai
        .request(server)
        .post("/register")
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.text.should.be.eql("User registered");
          done();
        });
    });
  });

  describe("/POST login a user", () => {
    it("it should login a user", (done) => {
      let user = {
        username: "testuser",
        password: "password123",
      };
      chai
        .request(server)
        .post("/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("token");
          done();
        });
    });
  });
});
