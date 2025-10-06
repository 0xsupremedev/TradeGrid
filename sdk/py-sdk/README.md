# TradeGrid Python SDK

Install (editable):
```
pip install -e .
```

Usage:
```python
from tradegrid import TradeGridClient

client = TradeGridClient('http://localhost:8080')
print(client.place_order('bid', 100, 1, 'py-demo'))
print(client.orderbook())
```


