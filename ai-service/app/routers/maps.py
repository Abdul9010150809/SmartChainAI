from fastapi import APIRouter
from pydantic import BaseModel, Field
import folium

router = APIRouter(tags=['maps'])


class MapPoint(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    label: str


class RouteMapRequest(BaseModel):
    origin: MapPoint
    current: MapPoint
    destination: MapPoint
    tracking_number: str


@router.post('/maps/route', response_model=dict)
def render_route_map(payload: RouteMapRequest) -> dict:
    points = [
        [payload.origin.latitude, payload.origin.longitude],
        [payload.current.latitude, payload.current.longitude],
        [payload.destination.latitude, payload.destination.longitude]
    ]

    center_lat = sum(point[0] for point in points) / len(points)
    center_lng = sum(point[1] for point in points) / len(points)

    shipment_map = folium.Map(location=[center_lat, center_lng], zoom_start=5, tiles='CartoDB positron', control_scale=True)

    folium.Marker(
        [payload.origin.latitude, payload.origin.longitude],
        popup=f"Origin: {payload.origin.label}",
        tooltip='Origin',
        icon=folium.Icon(color='green', icon='play')
    ).add_to(shipment_map)

    folium.Marker(
        [payload.current.latitude, payload.current.longitude],
        popup=f"Current: {payload.current.label}",
        tooltip='Current',
        icon=folium.Icon(color='blue', icon='info-sign')
    ).add_to(shipment_map)

    folium.Marker(
        [payload.destination.latitude, payload.destination.longitude],
        popup=f"Destination: {payload.destination.label}",
        tooltip='Destination',
        icon=folium.Icon(color='red', icon='flag')
    ).add_to(shipment_map)

    folium.PolyLine(
        locations=points,
        color='#0f766e',
        weight=4,
        opacity=0.8,
        tooltip=f"Route for {payload.tracking_number}"
    ).add_to(shipment_map)

    shipment_map.fit_bounds(points, padding=(20, 20))
    html = shipment_map.get_root().render()

    return {
        'data': {
            'html': html
        }
    }
