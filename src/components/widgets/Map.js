import React from "react";
import {
  Map,
  Marker,
  GoogleApiWrapper,
  Polyline,
  InfoWindow,
} from "google-maps-react";
import mapStyles from "../../utils/mapStyles";
import { constant } from "../../utils/constants";

const MapContainer = (props) => {
  // initialize the view with user's current location
  let centered = props.pickupCoordinates;

  // centering the pickup location and dropoff location
  if (props.pickupCoordinates && props.dropoffCoordinates) {
    const latitude =
      (props.pickupCoordinates.lat + props.dropoffCoordinates.lat) / 2;
    const longitute =
      (props.pickupCoordinates.lng + props.dropoffCoordinates.lng) / 2;
    // centering the view with the pickup and dropoff coordinates
    centered = { lat: latitude, lng: longitute };
  }

  return (
    <Map
      google={props.google}
      zoom={13}
      initialCenter={centered}
      center={centered}
      onReady={(props, map) =>
        map.setOptions({
          styles: mapStyles,
        })
      }
      streetViewControl={false}
      fullscreenControl={false}
      mapTypeControl={false}
      zoomControl={true}
    >
      {/* drawing a polyline between pickup and dropoff from the pickupCoordinates and dropoffCoordinates */}
      <Polyline
        path={[props.pickupCoordinates, props.dropoffCoordinates]}
        strokeColor="#6EBD40"
        strokeOpacity={0.9}
        strokeWeight={3}
      />

      {/* marker and info window for user location and also pick up point */}
      <Marker
        title={"Pickup Location"}
        name={"Pickup Location"}
        position={props.pickupCoordinates}
        id={1}
        icon={{
          url: "/marker.png",
          scaledSize: new window.google.maps.Size(28, 28),
        }}
      >
        <InfoWindow
          pixelOffset={"0"}
          visible={true}
          marker={props.pickupCoordinates}
          position={props.pickupCoordinates}
        >
          <div>
            <p>Pickup</p>
          </div>
        </InfoWindow>
      </Marker>

      {/* marker and info window for dropoff point when available */}
      <Marker
        name={"Dropoff Location"}
        title={"Dropoff Location"}
        position={props.dropoffCoordinates}
        id={2}
        icon={{
          url: "/marker.png",
          scaledSize: new window.google.maps.Size(28, 28),
        }}
      >
        <InfoWindow
          pixelOffset={"0"}
          visible={true}
          marker={props.dropoffCoordinates}
          position={props.dropoffCoordinates}
        >
          <div>
            <p>Dropoff</p>
          </div>
        </InfoWindow>
      </Marker>
    </Map>
  );
};

export default GoogleApiWrapper({
  apiKey: constant.apiKey,
})(MapContainer);
