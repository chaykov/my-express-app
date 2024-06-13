// Endpoint do odświeżania tokena
app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  console.log("Received Refresh Token:", refreshToken); // Logowanie otrzymanego tokena
  if (!refreshToken) {
    return res.status(401).send("Access denied");
  }

  try {
    const verified = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    console.log("Verified Token:", verified); // Logowanie zweryfikowanego tokena
    const newToken = jwt.sign(
      { userId: verified.userId, roles: verified.roles },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token: newToken });
  } catch (err) {
    console.error("Error verifying token:", err); // Logowanie błędów
    res.status(400).send("Invalid refresh token");
  }
});

// Generation token JWT
const token = jwt.sign({ userId: user._id, roles: user.roles }, JWT_SECRET, {
  expiresIn: "1h",
});
const refreshToken = jwt.sign(
  { userId: user._id, roles: user.roles },
  JWT_REFRESH_SECRET,
  { expiresIn: "7d" }
);
console.log("Generated Tokens:", { token, refreshToken }); // Logowanie tokenów
res.status(200).json({ token, refreshToken });
