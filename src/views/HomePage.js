/*global google*/
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  TextField,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  List,
  Button,
  Card,
} from "@material-ui/core";
import { ArrowBackIos, LocationOn } from "@material-ui/icons";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import Map from "../components/widgets/Map";
import axios from "axios";
import { api } from "../utils/api";
import { constant } from "../utils/constants";

const HomePage = (props) => {
  const [screen, setScreen] = useState("map"),
    [pickupAddress, setPickupAddress] = useState(""),
    [dropoffAddress, setDropoffAddress] = useState(""),
    [pickupCoordinates, setPickupCoordinates] = useState(""),
    [dropoffCoordinates, setDropoffCoordinates] = useState(""),
    [currentLocationCoordinates, setCurrentLocationCoordinates] = useState(""),
    [currentLocation, setCurrentLocation] = useState("contents"),
    [menu, setMenu] = useState("none"),
    [searchData, setSearchdata] = useState([]),
    [locationsFromDb, setLocationsFromDb] = useState([]);

  // handle show map screen and setting user's current location
  const showMap = () => {
    setScreen("map");
    setCurrentLocation("contents");
    uniqueSuggestion();
  };

  // handle pickup screen on focusing pickup address input
  const showPickup = () => {
    setScreen("pickup");
  };

  // handle dropoff screen on focusing dropoff address input
  const showDropoff = () => {
    setScreen("dropoff");
  };

  // getting user's current location on page mount
  const getUserLocation = (position) => {
    const { latitude, longitude } = position?.coords;
    setPickupCoordinates({ lat: latitude, lng: longitude });
    setCurrentLocationCoordinates({ lat: latitude, lng: longitude });
  };

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition(getUserLocation);
  }, []);

  // loading saved location from the database
  useEffect(() => {
    (async function fetchData() {
      api()
        .get("/locations")
        .then((res) => {
          setLocationsFromDb(res.data.data);
        })
        .catch((err) => console.error("Error", err));
    })();
    // fetchData();
  }, []);

  const suggestionCapture = [];

  let savedLocation = [];

  // return unique values, process them into desired object format, and store in database
  const uniqueSuggestion = () => {
    let uniqueSugggestionsData = Array.from(
      new Set(suggestionCapture.map(JSON.stringify))
    ).map(JSON.parse);

    uniqueSugggestionsData.map((suggestionData) => {
      geocodeByAddress(suggestionData.desc)
        .then((response) => getLatLng(response[0]))
        .then((latLng) => {
          savedLocation.unshift({
            address: suggestionData.desc,
            main: suggestionData.main,
            sec: suggestionData.sec,
            lat: latLng.lat,
            lng: latLng.lng,
          });

          return savedLocation;
        })
        .then((res) => {
          return res[0];
        })
        .then((res) => api().post("/locations", res))
        .catch((err) => console.error("Error", err));

      return savedLocation;
    });

    return savedLocation;
  };

  //Functional Component holding content to be displayed on load of application

  const mapPage = (props) => {
    return (
      <Box style={{ height: "100vh" }}>
        <AppBar
          position="static"
          style={{
            backgroundColor: "white",
            color: "black",
            fontWeight: "bolder",
            boxShadow: "0px 0px 0px 0px",
          }}
        >
          <Toolbar align="center">
            <Typography
              variant="h5"
              fontWeight="fontWeightBold"
              style={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}
            >
              <Box fontWeight="fontWeightBold">Parcel request</Box>
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Input fields serving as gateway to accept pickup and dropoff details */}
        <Box display="flex" flexDirection="column" mx={2}>
          <div onClick={showPickup}>
            <TextField
              id="1"
              label="Pickup address"
              variant="filled"
              margin="normal"
              fullWidth
              value={pickupAddress}
            />
          </div>
          <div onClick={showDropoff}>
            <TextField
              id="2"
              label="Dropoff address"
              variant="filled"
              margin="normal"
              fullWidth
              value={dropoffAddress}
            />
          </div>
        </Box>

        {/* Section displaying rendered map */}
        <Box style={{ height: "100%" }}>
          <Map
            pickupCoordinates={pickupCoordinates}
            dropoffCoordinates={dropoffCoordinates}
          />
        </Box>

        {/* Section to display order details when ready */}
        {pickupAddress && dropoffAddress ? (
          <Card style={{ width: "100%" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              p={1}
              fontWeight="fontWeightBold"
              fontSize="h5.fontSize"
            >
              <Box>
                {" "}
                ₦1500,<small>00</small>
              </Box>
              <Box>
                {" "}
                <small>3.3km</small> | <small>24 mins</small>
              </Box>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              style={{ marginBottom: "12px" }}
              p={1}
            >
              <Button
                style={{
                  marginBottom: "30px",
                  color: "white",
                  backgroundColor: "#00c799",
                  padding: "12px",
                }}
                size="large"
                variant="contained"
                fullWidth
              >
                Enter Parcel Details
              </Button>
            </Box>
          </Card>
        ) : null}
      </Box>
    );
  };

  //Functional Component to display interface for pickup details
  const pickupPage = (props) => {
    //Onchange functionality executed as user inputs value
    const handleChangePickup = (address) => {
      checker();
      const formattedAddress = address.toLowerCase();

      const locationsInDb = locationsFromDb.filter((location) =>
        location.address.includes(formattedAddress)
      );

      if (locationsInDb.length === 0) {
        setPickupAddress(address);
        setMenu("none");
      } else {
        setMenu("contents");
        setPickupAddress(address);
        setSearchdata(locationsInDb);
      }
    };

    // toggle select from current location option
    const checker = (e) => {
      setCurrentLocation("none");
    };

    const handleSelectPickup = (address) => {
      geocodeByAddress(address)
        .then((results) => {
          getLatLng(results[0]);
          // console.log("RESSSSS", results);
          // api().post("/locations", results[0]);
        })
        .then((latLng) => {
          console.log("LN", latLng);
          setPickupCoordinates(latLng);
          setPickupAddress(address);
          showMap();
        })
        .catch((error) => console.error("Error", error));
    };

    const handlePickupFromBb = (loc) => {
      setPickupCoordinates({ lat: loc.lat, lng: loc.lng });

      const addressBack = loc.address.replace(
        /(^\w{1})|(\s{1}\w{1})/g,
        (match) => match.toUpperCase()
      );

      setPickupAddress(addressBack);

      showMap();
    };

    // setting current location as pickup location
    const selectFromCurrentLocation = () => {
      axios(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocationCoordinates.lat},${currentLocationCoordinates.lng}&key=${constant.apiKey}`
      )
        .then((response) => response.data.results)
        .then((result) => setPickupAddress(result[0].formatted_address))
        .then(showMap());
      setPickupCoordinates({
        lat: currentLocationCoordinates.lat,
        lng: currentLocationCoordinates.lng,
      });
    };

    // configure autocomplete options
    const searchOptions = {
      location: new google.maps.LatLng(
        currentLocationCoordinates.lat,
        currentLocationCoordinates.lng
      ),
      radius: 50000,
      types: ["address"],
      componentRestrictions: { country: "ng" },
      strictBounds: true,
    };

    return (
      <Box style={{ height: "100vh" }}>
        <AppBar
          position="static"
          style={{
            backgroundColor: "white",
            color: "black",
            fontWeight: "bolder",
            boxShadow: "0px 0px 0px 0px",
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={showMap}
            >
              <ArrowBackIos />
              <Typography variant="subtitle1">Back</Typography>
            </IconButton>

            <Typography
              variant="h5"
              style={{
                flexGrow: 1,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Pickup &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Dynamic content to display input for either data from the autocomplete function or from the database */}
        {menu === "contents" ? (
          <Box mx={2}>
            <TextField
              variant="filled"
              defaultValue={pickupAddress}
              fullWidth
              autoFocus
              {...{
                placeholder: "Pickup address",
                className: "location-search-input",
              }}
              onFocus={(e) => checker(e)}
              onChange={(e) => handleChangePickup(e.target.value)}
            />
            {searchData.map((loc) => {
              return (
                <Box my={2}>
                  <ListItem
                    style={{ borderBottom: "1px solid #f1f1f1" }}
                    onClick={() => handlePickupFromBb(loc)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <LocationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={loc.main} secondary={loc.sec} />
                  </ListItem>
                </Box>
              );
            })}
          </Box>
        ) : (
          <PlacesAutocomplete
            value={pickupAddress}
            onChange={handleChangePickup}
            onSelect={handleSelectPickup}
            searchOptions={searchOptions}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <Box mx={2}>
                <TextField
                  variant="filled"
                  autoFocus
                  defaultValue={pickupAddress}
                  fullWidth
                  {...getInputProps({
                    placeholder: "Pickup address",
                  })}
                />
                <div
                  style={{ display: currentLocation }}
                  onClick={selectFromCurrentLocation}
                >
                  <ListItem style={{ borderBottom: "1px solid #f5f5f9" }}>
                    <ListItemAvatar>
                      <Avatar>
                        <LocationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Current Location"
                      secondary="Pick up from current location"
                    />
                  </ListItem>
                </div>

                <div className="autocomplete-dropdown-container">
                  {loading && <div>Loading...</div>}
                  {
                    <List>
                      {suggestions.map((suggestion) => {
                        suggestionCapture.push({
                          desc: suggestion.description,
                          main: suggestion.formattedSuggestion.mainText,
                          sec: suggestion.formattedSuggestion.secondaryText,
                        });

                        const className = suggestion.active
                          ? "suggestion-item--active"
                          : "suggestion-item";

                        const style = suggestion.active
                          ? { backgroundColor: "#fafafa", cursor: "pointer" }
                          : { backgroundColor: "#ffffff", cursor: "pointer" };

                        return (
                          <div
                            {...getSuggestionItemProps(suggestion, {
                              className,
                              style,
                            })}
                          >
                            <ListItem
                              style={{ borderBottom: "1px solid #f5f5f9" }}
                            >
                              <ListItemAvatar>
                                <Avatar>
                                  <LocationOn />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  suggestion.formattedSuggestion.mainText
                                }
                                secondary={
                                  suggestion.formattedSuggestion.secondaryText
                                }
                              />
                            </ListItem>
                          </div>
                        );
                      })}
                    </List>
                  }
                </div>
              </Box>
            )}
          </PlacesAutocomplete>
        )}
      </Box>
    );
  };

  // component to display interface for dropoff details
  const dropoffPage = (props) => {
    const handleChangeDrop = (address) => {
      const formattedAddress = address.toLowerCase();

      const locationsInDb = locationsFromDb.filter((location) =>
        location.address.includes(formattedAddress)
      );
      if (locationsInDb.length === 0) {
        setDropoffAddress(address);
        setMenu("none");
      } else {
        setMenu("contents");
        setDropoffAddress(address);
        setSearchdata(locationsInDb);
        setDropoffAddress(address);
      }
    };

    //OnSelect functionality executed when user confirms address, for values coming from autoComplete api
    const handleSelectDrop = (address) => {
      geocodeByAddress(address)
        .then((results) => getLatLng(results[0]))
        .then((latLng) => {
          setDropoffCoordinates(latLng);
          setDropoffAddress(address);
          showMap();
        })
        .catch((error) => console.error("Error", error));
    };

    //OnSelect functionality executed when user confirms address, for values coming from database
    const handleDropFromDB = (loc) => {
      setDropoffCoordinates({ lat: loc.lat, lng: loc.lng });

      const addressBack = loc.address.replace(
        /(^\w{1})|(\s{1}\w{1})/g,
        (match) => match.toUpperCase()
      );

      setDropoffAddress(addressBack);

      showMap();
    };

    // configure autocomplete options
    const searchOptions = {
      location: new google.maps.LatLng(
        currentLocationCoordinates.lat,
        currentLocationCoordinates.lng
      ),
      radius: constant.radius, // in meter (50000M is equivalent to 50KM)
      types: ["address"],
      componentRestrictions: { country: "ng" },
      strictBounds: true,
    };

    return (
      <Box style={{ height: "100vh" }}>
        <AppBar
          position="static"
          style={{
            backgroundColor: "white",
            color: "black",
            fontWeight: "bolder",
            boxShadow: "0px 0px 0px 0px",
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={showMap}
            >
              <ArrowBackIos />
              <Typography variant="subtitle1">Back</Typography>
            </IconButton>

            <Typography
              variant="h5"
              style={{
                flexGrow: 1,
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Dropoff &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Dynamic content to display input for either data from the autocomplete function or from the database */}
        {menu === "contents" ? (
          <Box mx={2}>
            <TextField
              variant="filled"
              defaultValue={dropoffAddress}
              fullWidth
              autoFocus
              {...{
                placeholder: "Dropoff address",
                className: "location-search-input",
              }}
              onChange={(e) => handleChangeDrop(e.target.value)}
            />
            {searchData.map((loc) => {
              return (
                <Box my={2}>
                  <ListItem
                    style={{ borderBottom: "1px solid #f1f1f1" }}
                    onClick={() => handleDropFromDB(loc)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <LocationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={loc.main} secondary={loc.sec} />
                  </ListItem>
                </Box>
              );
            })}
          </Box>
        ) : (
          <PlacesAutocomplete
            value={dropoffAddress}
            onChange={handleChangeDrop}
            onSelect={handleSelectDrop}
            searchOptions={searchOptions}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <Box mx={2}>
                <TextField
                  variant="filled"
                  autoFocus
                  defaultValue={dropoffAddress}
                  fullWidth
                  {...getInputProps({
                    placeholder: "Dropoff address",
                  })}
                />

                <div className="autocomplete-dropdown-container">
                  {loading && <div>Loading...</div>}
                  {
                    <List>
                      {suggestions.map((suggestion) => {
                        suggestionCapture.push({
                          desc: suggestion.description,
                          main: suggestion.formattedSuggestion.mainText,
                          sec: suggestion.formattedSuggestion.secondaryText,
                        });

                        const className = suggestion.active
                          ? "suggestion-item--active"
                          : "suggestion-item";

                        const style = suggestion.active
                          ? { backgroundColor: "#fafafa", cursor: "pointer" }
                          : { backgroundColor: "#ffffff", cursor: "pointer" };

                        return (
                          <div
                            {...getSuggestionItemProps(suggestion, {
                              className,
                              style,
                            })}
                          >
                            <ListItem
                              style={{ borderBottom: "1px solid #f5f5f9" }}
                            >
                              <ListItemAvatar>
                                <Avatar>
                                  <LocationOn />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  suggestion.formattedSuggestion.mainText
                                }
                                secondary={
                                  suggestion.formattedSuggestion.secondaryText
                                }
                              />
                            </ListItem>
                          </div>
                        );
                      })}
                    </List>
                  }
                </div>
              </Box>
            )}
          </PlacesAutocomplete>
        )}
      </Box>
    );
  };

  // displaying screen based on type
  if (screen === "map") return <div>{mapPage()}</div>;
  else if (screen === "pickup") return <div>{pickupPage()}</div>;
  else if (screen === "dropoff") return <div>{dropoffPage()}</div>;
  else return <div>{mapPage()}</div>;
};

export default HomePage;
