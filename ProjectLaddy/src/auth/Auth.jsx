import {
  Box,
  Button,
  Divider,
  Grid,
  Container,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Backdrop,
} from "@mui/material";
import {
  Badge,
  Email,
  Google,
  Key,
  PhoneIphone,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import UniversalPopup from "../universal/UniversalPopup";
import Dashboard from "../dashboard/Dashboard";

export default function Auth({ renderDashboard }) {
  const [session, setSession] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [currentLoginEmail, setLoginEmail] = useState("");
  const [dashboardOpen, showDashboard] = useState(false);

  // internal bad user input handling
  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [mobileInvalid, setMobileInvalid] = useState(false);
  const [passwordMatching, setPasswordMatching] = useState(true);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);

  // supabase states
  const [accountCreationFail, setAccountCreationFail] = useState(false);
  const [accountCreationSuccess, setAccountCreationSuccess] = useState(false);
  const [accountLoginFail, setAccountLoginFail] = useState(false);
  const [currentUserEmailData, setCurrentUserEmailData] = useState([]);

  async function fetchUserData() {
    const { data } = await supabase.from("users").select();
    setCurrentUserEmailData(data.map(({ email }) => email));
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  function toggleVisibility(e) {
    e.preventDefault();
    setPasswordVisible(!passwordVisible);
  }

  const validUsernameRegex = /^[a-zA-Z0-9]/;
  const validEmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  // async function supabaseLogInGoogle(e) {
  //   e.preventDefault();
  //   const

  // }

  async function supabaseLogIn(e) {
    e.preventDefault();
    const loginEmail = document.getElementById("user_login_email").value;
    const loginPassword = document.getElementById("user_login_password").value;
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setAccountLoginFail(true);
    } else {
      renderDashboard(session);
    }
  }

  async function supabaseRecoverPassword(e) {
    e.preventDefault();
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      document.getElementById("user_login_email").value
    );
    console.log(data);
  }

  async function supabaseSignUp(e) {
    e.preventDefault();

    const signUpUsername =
      document.getElementById("user_first_name").value +
      " " +
      document.getElementById("user_last_name").value;
    const signUpMobile = document.getElementById("user_phone_no").value;
    const signUpEmail = document.getElementById("user_email").value;
    const signUpPassword = document.getElementById("user_password").value;
    const confirmSignUpPassword = document.getElementById(
      "user_confirm_password"
    ).value;

    let usernameError = null;
    let mobileError = null;
    let emailError = null;
    let emailTaken = null;
    let passwordError = null;
    let termsAndConditionsError = null;

    const errors = [
      usernameError,
      mobileError,
      emailError,
      emailTaken,
      passwordError,
      termsAndConditionsError,
    ];

    if (
      !signUpUsername.match(validUsernameRegex) ||
      signUpUsername.match(validEmailRegex)
    ) {
      errors[0] = true;
      setUsernameInvalid(true);
    } else {
      errors[0] = false;
      setUsernameInvalid(false);
    }

    if (signUpMobile.length != 8) {
      errors[1] = true;
      setMobileInvalid(true);
    } else {
      errors[1] = false;
      setMobileInvalid(false);
    }

    // if (currentUserUsernameData.includes(signUpUsername)) {
    //   errors[1] = true;
    //   setUsernameTaken(true);
    // } else {
    //   errors[0] = false;
    //   setUsernameTaken(false);
    // }

    if (!signUpEmail.match(validEmailRegex)) {
      errors[2] = true;
      setEmailInvalid(true);
    } else {
      errors[2] = false;
      setEmailInvalid(false);
    }

    if (currentUserEmailData.includes(signUpEmail)) {
      errors[3] = true;
      setEmailTaken(true);
      document.getElementById("user_email").classList.add("error");
    } else {
      errors[3] = false;
      setEmailTaken(false);
    }

    if (!(signUpPassword === confirmSignUpPassword)) {
      errors[4] = true;
      setPasswordMatching(false);
      document.getElementById("user_password").classList.add("error");
      document.getElementById("user_confirm_password").classList.add("error");
    } else {
      errors[4] = false;
      setPasswordMatching(true);
    }

    if (!document.getElementById("termsAndConditionsError").checked) {
      errors[5] = true;
      document
        .getElementById("termsAndConditionsMessage")
        .classList.add("error");
    } else {
      errors[5] = false;
      document
        .getElementById("termsAndConditionsMessage")
        .classList.remove("error");
    }

    if (!errors.includes(true)) {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            username: signUpUsername,
          },
        },
      });
      if (error) {
        setAccountCreationFail(true);
      } else {
        await supabase.from("users").insert({
          email: signUpEmail,
          username: signUpUsername,
          mobile: signUpMobile,
        });
        setAccountCreationSuccess(true);
      }
    }
  }

  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.data.subscription.unsubscribe();
  }, []);

  async function retrieveSession() {
    const { data, error } = await supabase.auth.getSession();
    showDashboard(data.session !== null);
  }

  useEffect(() => {
    retrieveSession();
  });

  function closePopUpLoginFail(e) {
    e.preventDefault();
    setAccountLoginFail(false);
  }

  function closePopUpSignUpFail(e) {
    e.preventDefault();
    setAccountCreationFail(false);
  }

  function closePopUpSignupSuccess(e) {
    e.preventDefault();
    setAccountCreationSuccess(false);
  }

  function handleCloseLoginFail() {
    setAccountLoginFail(false);
  }

  function handleCloseSignUpFail() {
    setAccountCreationFail(false);
  }

  function handleCloseSignUpSuccess() {
    setAccountCreationSuccess(false);
  }

  function hideDashboard(e) {
    e.preventDefault();
    showDashboard(false);
  }

  return (
    <>
      {dashboardOpen ? (
        <Dashboard hideDashboard={hideDashboard} />
      ) : (
        <Box sx={{ padding: 5 }}>
          <Backdrop
            sx={{
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            open={accountLoginFail}
            onClick={handleCloseLoginFail}
          >
            <UniversalPopup
              closePopUp={closePopUpLoginFail}
              popupText={"Login failed. Check email/password?"}
            />
          </Backdrop>
          <Backdrop
            sx={{
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            open={accountCreationFail}
            onClick={handleCloseSignUpFail}
          >
            <UniversalPopup
              closePopUp={closePopUpSignUpFail}
              popupText={"Signup failed. Check fields?"}
            />
          </Backdrop>
          <Backdrop
            sx={{
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            open={accountCreationSuccess}
            onClick={handleCloseSignUpSuccess}
          >
            <UniversalPopup
              closePopUp={closePopUpSignupSuccess}
              popupText={
                "Signup success! Please verify your email before logging in"
              }
            />
          </Backdrop>
          {signUp ? (
            <Grid container spacing={0}>
              {/* <Grid item xs={6}>
          <Container
            style={{
              backgroundColor: "#E98356",
              padding: 20,
            }}
          >
            <p
              style={{
                fontFamily: "Montserrat",
                fontSize: 40,
                color: "white",
              }}
            >
              Dive right in
            </p>
            <img width={300} src={Auth1} />
          </Container>
        </Grid> */}
              <Grid item xs={12}>
                <Container style={{ backgroundColor: "#F0D4C4", padding: 30 }}>
                  <p
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "white",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ color: "#A87FDB" }}>Dive right in.</div>
                    <div style={{ color: "#E98356" }}>Set up your account.</div>
                  </p>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="First Name"
                      id="user_first_name"
                      style={{ backgroundColor: "white" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      id="user_last_name"
                      style={{ backgroundColor: "white" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Mobile Phone number"
                      id="user_phone_no"
                      style={{ backgroundColor: "white" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIphone />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {mobileInvalid && (
                      <p
                        style={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                        }}
                      >
                        Phone number invalid!
                      </p>
                    )}
                    <TextField
                      fullWidth
                      label="Email Address"
                      id="user_email"
                      style={{ backgroundColor: "white" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {emailInvalid && (
                      <p
                        style={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                        }}
                      >
                        Invalid email!
                      </p>
                    )}
                    {emailTaken && (
                      <p
                        style={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                        }}
                      >
                        Email taken!
                      </p>
                    )}
                    <TextField
                      fullWidth
                      label="Password"
                      id="user_password"
                      type={passwordVisible ? "text" : "password"}
                      style={{ backgroundColor: "white" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Key />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={toggleVisibility}>
                              {passwordVisible ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      id="user_confirm_password"
                      type={passwordVisible ? "text" : "password"}
                      style={{ backgroundColor: "white" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Key />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={toggleVisibility}>
                              {passwordVisible ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {!passwordMatching && (
                      <p
                        style={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                        }}
                      >
                        Passwords don't match!
                      </p>
                    )}
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="termsAndConditionsError"
                          sx={{
                            color: "black",
                            "&.Mui-checked": { color: "black" },
                          }}
                        />
                      }
                      style={{
                        color: "#7F7F7F",
                        fontSize: 10,
                      }}
                      label=<div id="termsAndConditionsMessage">
                        "I agree to the Terms and Conditions"
                      </div>
                    />
                  </Stack>
                  <br />
                  <Button
                    variant="contained"
                    onClick={supabaseSignUp}
                    style={{
                      backgroundColor: "#4B72C2",
                      fontFamily: "Montserrat",
                      fontSize: 12,
                      display: "flex",
                      justifyContent: "left",
                    }}
                  >
                    Sign me Up!
                  </Button>
                  <hr style={{ borderWidth: 1, borderColor: "black" }} />
                  <p
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: 15,
                      color: "#7F7F7F",
                      textAlign: "left",
                    }}
                  >
                    Already have an account?
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSignUp(false);
                        setEmailInvalid(false);
                        setEmailTaken(false);
                        setPasswordMatching(true);
                      }}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                        color: "#4B72C2",
                        cursor: "pointer",
                      }}
                    >
                      Sign In
                    </button>
                  </p>
                </Container>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={0}>
              {/* <Grid item xs={6}>
        <Container
          style={{
            backgroundColor: "#E98356",
            padding: 20,
          }}
        >
          <p
            style={{
              fontFamily: "Montserrat",
              fontSize: 40,
              color: "white",
            }}
          >
            Dive right in
          </p>
          <img width={300} src={Auth1} />
        </Container>
      </Grid> */}
              <Grid item xs={12}>
                <Container style={{ backgroundColor: "#F0D4C4", padding: 30 }}>
                  <p
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "white",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ color: "#A87FDB" }}>Welcome.</div>
                    <div style={{ color: "#E98356" }}>Login.</div>
                  </p>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      id="user_login_email"
                      style={{ backgroundColor: "white" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      id="user_login_password"
                      type={passwordVisible ? "text" : "password"}
                      style={{ backgroundColor: "white" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Key />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={toggleVisibility}>
                              {passwordVisible ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "Montserrat",
                        fontSize: 15,
                        color: "#7F7F7F",
                        textAlign: "left",
                      }}
                    >
                      Need an account?
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSignUp(true);
                        }}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          color: "#553BF1",
                          cursor: "pointer",
                        }}
                      >
                        Sign Up.
                      </button>
                    </p>
                    <p
                      style={{
                        fontFamily: "Montserrat",
                        fontSize: 15,
                        color: "#7F7F7F",
                        textAlign: "left",
                      }}
                    >
                      Forgot password?
                      <button
                        onClick={supabaseRecoverPassword}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          color: "#553BF1",
                          cursor: "pointer",
                        }}
                      >
                        Recover.
                      </button>
                    </p>
                    {/* <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        color: "black",
                        "&.Mui-checked": { color: "black" },
                      }}
                    />
                  }
                  style={{
                    color: "#7F7F7F",
                    fontSize: 10,
                  }}
                  label="Remember me"
                /> */}
                  </Stack>
                  <br />
                  {/* {accountLoginFail && <p>Login failed. Check email/password?</p>} */}
                  <Button
                    variant="contained"
                    onClick={supabaseLogIn}
                    style={{
                      width: 200,
                      backgroundImage: "linear-gradient(#893BE6, #F19065)",
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      fontSize: 12,
                      borderRadius: 15,
                    }}
                  >
                    Log In
                  </Button>
                  {/* <br />
                  <br />
                  <Divider>OR</Divider>
                  <br /> */}
                  {/* <Button
                variant="contained"
                style={{
                  width: 200,
                  backgroundColor: "white",
                  color: "black",
                  textAlign: "center",
                  fontFamily: "Montserrat",
                  fontWeight: "bold",
                  fontSize: 12,
                  borderRadius: 30,
                  //   marginRight: 20,
                }}
                startIcon={<School style={{ color: "black" }} />}
              >
                Login with NUS
              </Button> */}
                  {/* <br />
              <br /> */}
                  {/* <Button
                    variant="contained"
                    style={{
                      width: 200,
                      backgroundImage: "linear-gradient(#F9AF3A, #DE5F8F)",
                      color: "black",
                      textAlign: "center",
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      fontSize: 12,
                      borderRadius: 30,
                    }}
                    startIcon={<Google style={{ color: "black" }} />}
                  >
                    Login with Google
                  </Button> */}
                </Container>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </>
  );
}
