# iZone

## Intro
iZone is a zone managment system for FiveM.

It offers utlities to create, manage zone, detect if a player is in a zone and offer the possibility to trap the player in a zone.

**Dependency: [mysql-async](https://github.com/brouznouf/fivem-mysql-async)**

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

**If you have any issue with the cursor not disappearing**: Make sure to name the resource: `izone`.

Execute `zones.sql` on your MySQL server.

## Configuration :
Open up the `config.lua` file:

* `USE_ESSENTIALMODE_ADMIN_SYSTEM`: if true, it'll use the essentialmode admin system.
* `ESSENTIALMODE_PERMISSION_LEVEL_REQUIRED`: the minimum permission level to create and manage zones.
* `ADMINS`: a list of identifiers to allow iZone uses.
* `CONTROL_TO_OPEN_PANEL`, `CONTROL_TO_ADD_POINT` and `CONTROL_TO_REMOVE_LAST_POINT`: Controls configurations.
* `ENABLE_UNAUTHORIZE_WARNING_LOGS`: if true, will print a warning when someone is trying to call iZone events without being authorized.

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
Then stuck him into the zone (call every tick or every 100 ms, your call):
```lua
TriggerEvent("izone:trapPlayerInZone", "zone1")
```

## See examples in example.lua

## Changelogs :
> :warning: **If you came from v1.3 (or less) and you want to use v1.4**: Please rename the `maxLength` db property to `max_length`. Else it'll **NOT** works.
* v1.4:
    - Removed `__resource.lua` in favor of `fxmanifest.lua`.
    - Updated Svelte to the latest version (3.12.1) .
    - Fixed an overflow bug [#6](https://github.com/izio38/iZone/issues/6).
    - Some UI improvments.
    - Some code cleanup.