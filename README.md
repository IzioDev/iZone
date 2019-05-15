# iZone

## Intro
iZone is a zone managment system for FiveM.

It offers utlities to create, manage zone and detecting if a player is in a zone.

It also can trap a player in a zone! what a chance!

**Dependency: mysql-async**

## What it looks like?
### _*Panel:*_

![Admin Panel](https://i.gyazo.com/5c4867dabf2b67c4210715362f68b063.png)

### _*Zone Creation:*_

![Admin Panel](https://i.gyazo.com/f3bb3254041136c4fade53a8cd78abac.jpg)

### _*Ugly prompt:_*

![Admin Panel](https://i.gyazo.com/eb631d22915e5b43e00b61bbb6c2968e.jpg)

## How to install it?
Download this repo:

`git clone https://github.com/izio38/iZone.git`, or click the download button.

Execute `zones.sql` on your MySQL server.

## How to use it?
Zone creation is explained in the in-game panel.

### Know if a player is in a zone:
```lua
Citizen.CreateThread(function()
    while true do
        Wait(100)
        TriggerEvent("izone:isPlayerInZone", "zone1", function(isIn)
            print(isIn)
        end)
    end
end)
```
`TriggerEvent("izone:isPlayerInZone", "zone1", cb(val))` -> val can be either false, true or nil. nil if the zone doesn't exist.

### Know if a player is in a zone with a categorie name:
```lua
Citizen.CreateThread(function()
    while true do
        Wait(100)
        TriggerEvent("izone:isPlayerInCatZone", "foot", "field1", function(isIn)
            print(isIn)
        end)
    end
end)
```

### Know if a player in at least one zone in a given categorie:
```lua
Citizen.CreateThread(function()
    while true do
        Wait(100)
        TriggerEvent("izone:isPlayerInAtLeastInOneZoneInCat", "mySuperCat", function(isIn)
            print(isIn)
        end)
    end
end)
```

### Return all zone the player is in:
```lua
Citizen.CreateThread(function()
    while true do
        Wait(100)
        TriggerEvent("izone:getAllZonesThePlayerIsIn", function(zones)
            print(json.encode(zones))
        end)
    end
end)
```
Note: This return `{}` if there is no zone. Else the format is:
```lua
    zones = {
        {name = "", cat = "", center = {x = 1, y = 2}, ...},
        {name = "", cat = "", center = {x = 1, y = 2}, ...},
        {name = "", cat = "", center = {x = 1, y = 2}, ...}
    }
```
I'm not sure about performence tho.

### Trap a player in a zone:
First initiate the trap (it teleport the player in the zone if the player isn't in there already):
```lua
TriggerEvent("izone:initiateATrapZone", "zone1")
```
Then stuck him to the zone (call every tick or every 100 ms, your call):
```lua
TriggerEvent("izone:trapPlayerInZone", "zone1")
```



### See examples in example.lua
