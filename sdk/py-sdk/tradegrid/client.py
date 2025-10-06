import os
import requests


class TradeGridClient:
    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or os.getenv("ENGINE_URL") or "http://localhost:8080").rstrip("/")

    def place_order(self, side: str, price: int, size: int, owner: str):
        r = requests.post(self.base_url + "/place_order", json={
            "side": side,
            "price": str(price),
            "size": str(size),
            "owner": owner,
        })
        r.raise_for_status()
        return r.json()

    def cancel_order(self, id: int):
        r = requests.post(self.base_url + "/cancel_order", json={"id": id})
        r.raise_for_status()
        return r.json()

    def orderbook(self):
        r = requests.get(self.base_url + "/orderbook")
        r.raise_for_status()
        return r.json()


