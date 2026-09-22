import networkx as nx
import math
from models import Zone
from typing import List, Dict

def _haversine_dist(lat1, lon1, lat2, lon2):
    # Rough Euclidean is fine for small areas, but haversine is better
    R = 6371.0 # earth radius km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def build_routing_graph(zones: List[Zone]):
    G = nx.Graph()
    
    for z in zones:
        G.add_node(z.zone_id, lat=z.latitude, lon=z.longitude, name=z.name)
        
    # Connect each zone to its 4 nearest neighbors
    for z1 in zones:
        distances = []
        for z2 in zones:
            if z1.zone_id != z2.zone_id:
                dist = _haversine_dist(z1.latitude, z1.longitude, z2.latitude, z2.longitude)
                distances.append((dist, z2))
                
        distances.sort(key=lambda x: x[0])
        # Add edges to nearest 4
        for dist, z2 in distances[:4]:
            G.add_edge(z1.zone_id, z2.zone_id, weight=dist)
            
    return G

def find_flood_aware_route(zones_with_risk: List[dict], origin_id: str, dest_id: str):
    # Rebuild basic zones object list for graph builder
    class DummyZone:
        def __init__(self, d):
            self.zone_id = d["zone_id"]
            self.name = d["name"]
            self.latitude = d["latitude"]
            self.longitude = d["longitude"]
    
    zones = [DummyZone(z) for z in zones_with_risk]
    G = build_routing_graph(zones)
    
    # Create lookup for risk penalties
    risk_penalties = {}
    for z in zones_with_risk:
        band = z["risk_band"]
        if band == "Severe":
            penalty = 100.0 # Huge penalty
        elif band == "High":
            penalty = 10.0
        elif band == "Medium":
            penalty = 2.0
        else:
            penalty = 1.0
        risk_penalties[z["zone_id"]] = penalty
        
    # Weight function for NetworkX shortest path
    def weight_func(u, v, edge_attr):
        base_dist = edge_attr.get("weight", 1.0)
        # Apply penalty based on target node risk
        penalty = risk_penalties.get(v, 1.0)
        return base_dist * penalty
        
    try:
        path = nx.shortest_path(G, source=origin_id, target=dest_id, weight=weight_func)
        
        # Build route geometry
        route_nodes = []
        for node in path:
            node_data = G.nodes[node]
            route_nodes.append({
                "zone_id": node,
                "name": node_data["name"],
                "lat": node_data["lat"],
                "lon": node_data["lon"]
            })
            
        return {"route": route_nodes, "status": "success"}
    except nx.NetworkXNoPath:
        return {"status": "error", "message": "No route found."}
    except nx.NodeNotFound:
        return {"status": "error", "message": "Origin or destination not found in network."}
