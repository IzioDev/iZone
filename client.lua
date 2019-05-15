local debug = true
local group
local admin = false
local isInUse = false
local points = {}
local allZone = {}

Citizen.CreateThread(function()
    -- not being stuck on relaod
    TriggerServerEvent("izone:gimme")
    if (not(Config.USE_ESSENTIALMODE_ADMIN_SYSTEM)) then
        TriggerServerEvent("izone:admin")
    end
    if debug then SetNuiFocus(false, false) end
    while true do
        Citizen.Wait(1)
        if IsControlJustPressed(0, Config.CONTROL_TO_OPEN_PANEL) then
            if (Config.USE_ESSENTIALMODE_ADMIN_SYSTEM) then
                if group ~= "user" then
                    SetNuiFocus(true, true)
                    SendNUIMessage({openMenu = true, isInUse = isInUse, points = points, zones = allZone})
                end
            else
                if admin then
                    SetNuiFocus(true, true)
                    SendNUIMessage({openMenu = true, isInUse = isInUse, points = points, zones = allZone})
                end
            end
        elseif IsControlJustPressed(0, Config.CONTROL_TO_ADD_POINT) and isInUse then
            
            local x, y, z = table.unpack(GetEntityCoords(GetPlayerPed(-1), true))
            TriggerEvent("izone:notification", "Point added: ".. "x = "..tostring(math.ceil(x)) .. " y = " .. tostring(math.ceil(y)) .. " z = " .. tostring(math.ceil(z)), true)
            table.insert(points, {xs = x, ys = y, zs = z})
            Wait(1000)

        elseif IsControlJustPressed(0, Config.CONTROL_TO_REMOVE_LAST_POINT) and isInUse then
            TriggerEvent("izone:notification", "Removed the last point", true)
            table.remove(points, #points)
            Wait(1000)
        end

        if #points > 0 then
			for i = 1, #points do
				DrawMarker(0, points[i].xs, points[i].ys, points[i].zs, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 3.0, 46, 89, 227, 230, 0, 0, 0,0)
				draw3DText(points[i].xs, points[i].ys, points[i].zs + 2.01 , "Point ~r~" .. i, 1, 0.5, 0.5)
			end
		end

		if #points > 1 then
			for i = 1, #points do
				if i ~= #points then
					DrawLine(points[i].xs, points[i].ys, points[i].zs, points[i+1].xs, points[i+1].ys, points[i+1].zs, 244, 34, 35, 230)
				else
					DrawLine(points[i].xs, points[i].ys, points[i].zs, points[1].xs, points[1].ys, points[1].zs, 244, 34, 35, 230)
				end
			end
        end

        if isInUse then
            HelpPromt("Add a point : ~INPUT_CELLPHONE_CAMERA_FOCUS_LOCK~ \nRemove last point: ~INPUT_REPLAY_SHOWHOTKEY~")
        end
        
    end
end)

if (not(Config.USE_ESSENTIALMODE_ADMIN_SYSTEM)) then
    AddEventHandler("playerSpawned", function()
        TriggerServerEvent("izone:gimme")
        TriggerServerEvent("izone:admin")
    end)

    RegisterNetEvent("izone:okadmin")
    AddEventHandler("izone:okadmin", function()
        admin = true
    end)
end

RegisterNetEvent("izone:transfertzones")
AddEventHandler("izone:transfertzones", function(zones)
    print(#zones)
    allZone = zones
end)

RegisterNUICallback('close', function(data, cb)
	SetNuiFocus(false, false)
end)

RegisterNUICallback('stop', function(data, cb)
    SetNuiFocus(false, false)
    isInUse = false
    points = {}
end)


RegisterNUICallback('error', function(data, cb)
	TriggerEvent("izone:notification", "Error: ".. data.message, 0)
end)

RegisterNUICallback('checkSsave', function(data, cb)
    SetNuiFocus(false, false)
    if (data.error) then
        TriggerEvent("izone:notification", "Error: You need to have 3 points or more to save.", 0)
    else
        SendNUIMessage({openPrompt = true, isInUse = isInUse, points = points})
        SetNuiFocus(true, true)
    end
end)

RegisterNUICallback('save', function(data, cb)
    SetNuiFocus(false, false)
    isInUse = false
    TriggerServerEvent("izone:saveZone", points, data.name, data.cat)
    points = {}
end)

RegisterNUICallback('create', function(data, cb)
    SetNuiFocus(false, false)
    if (isInUse) then
        TriggerEvent("izone:notification", "already in use", 0)
    else
        isInUse = true
    end
end)

RegisterNUICallback('tp', function(data, cb)
    SetNuiFocus(false, false)
    TeleportPlayerToCoords(data.x, data.y, data.z)
end)

RegisterNUICallback('delete', function(data, cb)
    SetNuiFocus(false, false)
    TriggerServerEvent("izone:deleteZone", data.id)
end)

RegisterNetEvent("izone:notification")
AddEventHandler("izone:notification", function(msg, state)
	if state then
		message = "~g~"..msg
	else
		message = "~r~"..msg
	end
	SetNotificationTextEntry("STRING")
    AddTextComponentString(message)
    DrawNotification(false, false)
end)

function draw3DText(x,y,z,textInput,fontId,scaleX,scaleY)
    local px,py,pz=table.unpack(GetGameplayCamCoords())
    local dist = GetDistanceBetweenCoords(px,py,pz, x,y,z, 1)

    local scale = (1/dist)*20
    local fov = (1/GetGameplayCamFov())*100
    local scale = scale*fov

    SetTextScale(scaleX*scale, scaleY*scale)
    SetTextFont(fontId)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 150)
    SetTextDropshadow(0, 0, 0, 0, 255)
    SetTextEdge(2, 0, 0, 0, 150)
    SetTextDropShadow()
    SetTextOutline()
    SetTextEntry("STRING")
    SetTextCentre(1)
    AddTextComponentString(textInput)
    SetDrawOrigin(x,y,z+2, 0)
    DrawText(0.0, 0.0)
    ClearDrawOrigin()
end

function TeleportPlayerToCoords(x, y, z)
	local myPly = GetPlayerPed(-1)
	SetEntityCoords(myPly, tonumber(x), tonumber(y), tonumber(z), 1, 0, 0, 1)
end

function HelpPromt(text)

	SetTextComponentFormat("STRING")
	AddTextComponentString(text)
	DisplayHelpTextFromStringLabel(0, false, false, -1)

end

-- API
local lastInCoords = nil

AddEventHandler("izone:initiateATrapZone", function(zone)
	TriggerEvent("izone:isPlayerInZone", zone, function(isIn)
        local found = FindZone(zone)
        if not(found) then return end
		if isIn then
			lastInCoords = GetEntityCoords(GetPlayerPed(-1), true)
		else
            TpPlayer(allZone[found].center)
            lastInCoords = GetEntityCoords(GetPlayerPed(-1), true)
		end
	end)
end)

function TpPlayer(coords)
	SetEntityCoords(GetPlayerPed(-1), coords.x, coords.y, coords.z, 0.0, 0.0, 0.0, 0)
end

AddEventHandler("izone:trapPlayerInZone", function(zone)
	local found = FindZone(zone)
	if not found or not lastInCoords then
		return
	else
		local plyCoords = GetEntityCoords(GetPlayerPed(-1), true)
		if GetDistanceBetweenCoords(plyCoords, tonumber(allZone[found].center.x), tonumber(allZone[found].center.y), 1.01, false) < tonumber(allZone[found].maxLength) then
			local n = windPnPoly(allZone[found].points, plyCoords)
			if n == 0 then
				TpPlayer(lastInCoords)
			else
				lastInCoords = plyCoords -- he's not in and not so far
			end
		else
			TpPlayer(lastInCoords) -- he's not in and prob far
		end
	end
end)

AddEventHandler("izone:getZoneCenter", function(zone, cb)
	local found = FindZone(zone)
	if not found then
		cb(nil)
	else
		cb(allZone[found].center)
	end
end)

AddEventHandler("izone:isPlayerInZone", function(zone, cb)
	local found = FindZone(zone)
	if not found then
		cb(nil)
	else
		local plyCoords = GetEntityCoords(GetPlayerPed(-1), true)
		if GetDistanceBetweenCoords(plyCoords, tonumber(allZone[found].center.x), tonumber(allZone[found].center.y), 1.01, false) < tonumber(allZone[found].maxLength) then
			local n = windPnPoly(allZone[found].points, plyCoords)
			if n ~= 0 then
				cb(true)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end
end)

AddEventHandler("izone:isPlayerInCatZone", function(zone, cat, cb)
	local found = FindZoneInCat(zone, cat)
	if not(found) then
		cb(nil)
	else
		local plyCoords = GetEntityCoords(GetPlayerPed(-1), true)
		if GetDistanceBetweenCoords(plyCoords, tonumber(allZone[found].center.x), tonumber(allZone[found].center.y), 1.01, false) < tonumber(allZone[found].maxLength) then
			local n = windPnPoly(allZone[found].points, plyCoords)
			if n ~= 0 then
				cb(true)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end
end)

AddEventHandler("izone:getAllZonesThePlayerIsIn", function(cb)
	local plyCoords = GetEntityCoords(GetPlayerPed(-1), true)
	local toReturn = {}
	for i,v in ipairs(allZone) do
		if GetDistanceBetweenCoords(plyCoords, tonumber(v.center.x), tonumber(v.center.y), 1.01, false) < tonumber(v.maxLength) then
			local n = windPnPoly(v.points, plyCoords)
			if n ~= 0 then
				table.insert(toReturn, v)
			end
		end
	end
	cb(toReturn)
end)

AddEventHandler("izone:isPlayerInAtLeastInOneZoneInCat", cat, function(cb)
	local zonesToTest = GetAllZoneInCat(cat)
	local plyCoords = GetEntityCoords(GetPlayerPed(-1), true)

	for i,v in ipairs(zonesToTest) do
		if GetDistanceBetweenCoords(plyCoords, tonumber(v.center.x), tonumber(v.center.y), 1.01, false) < tonumber(v.maxLength) then
			local n = windPnPoly(v.points, plyCoords)
			if n ~= 0 then
				cb(true)
			end
		end
	end
	cb(false)
end)

AddEventHandler("izone:isPointInZone", function(xr, yr, zone, cb)
	local found = FindZone(zone)
	if not found then
		cb(nil)
	else
		local flag = { x = tonumber(xr), y = tonumber(yr)}
		if GetDistanceBetweenCoords(xr, yr, 1.01, tonumber(allZone[found].center.x), tonumber(allZone[found].center.y), 1.01, false) < tonumber(allZone[found].maxLength) then
			local n = windPnPoly(allZone[found].points, flag)
			if n ~= 0 then
				cb(true)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end
end)

function windPnPoly(tablePoints, flag)
	if tostring(type(flag)) == table then
		py = flag.y
		px = flag.x
	else
		px, py, pz = table.unpack(GetEntityCoords(GetPlayerPed(-1), true))
	end
	wn = 0
	table.insert(tablePoints, tablePoints[1])
	for i=1, #tablePoints do
		if i == #tablePoints then
			break
		end
		if tonumber(tablePoints[i].y) <= py then
			if tonumber(tablePoints[i+1].y) > py then
				if IsLeft(tablePoints[i], tablePoints[i+1], flag) > 0 then
					wn = wn + 1
				end
			end
		else
			if tonumber(tablePoints[i+1].y) <= py then
				if IsLeft(tablePoints[i], tablePoints[i+1], flag) < 0 then
					wn = wn - 1
				end
			end
		end
	end
	return wn
end

function IsLeft(p1s, p2s, flag)
	p1 = p1s
	p2 = p2s
	if tostring(type(flag)) == "table" then
		p = flag
	else
		p = GetEntityCoords(GetPlayerPed(-1), true)
	end
	return ( ((p1.x - p.x) * (p2.y - p.y))
            - ((p2.x -  p.x) * (p1.y - p.y)) )
end

function FindZone(zone)
	for i = 1, #allZone do
		if allZone[i].name == zone then
			return i
		end
	end
	return false
end

function FindZoneInCat(zone, cat)
	for i = 1, #allZone do
		if allZone[i].name == zone and allZone[i].cat == cat then
			return i
		end
	end
	return false
end

function GetAllZoneInCat(cat)
	local toBeReturned = {}
	for i = 1, #allZone do
		if allZone[i].cat == cat then
			table.insert(toBeReturned, allZone[i])
		end
	end
	return toBeReturned
end