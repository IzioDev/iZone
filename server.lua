local Zones = nil

function isPlayerAuthorized(source)
    if (Config.USE_ESSENTIALMODE_ADMIN_SYSTEM) then
        -- Fetch the user and check permissions
        TriggerEvent('es:getPlayerFromId', source, function(user)
            if user and user.getPermissions() > Config.ESSENTIALMODE_PERMISSION_LEVEL_REQUIRED then
                return true
            end
            return false
        end)
    else  
        for _,authorizedIdentifier in ipairs(Config.ADMINS) do
            for _,playerIdentifier in ipairs(GetPlayerIdentifiers(source)) do
                if playerIdentifier == authorizedIdentifier then
                    return true
                end
            end
        end
        return false
    end
end

function fetchZone()
    MySQL.ready(function()
        MySQL.Async.fetchAll('SELECT * FROM zones', {}, function(zones)
            for i,v in ipairs(zones) do
                zones[i].points = json.decode(zones[i].points)
                zones[i].center = json.decode(zones[i].center)
            end
            Zones = zones

            for i,playerServerId in ipairs(GetPlayers()) do
                TriggerClientEvent("izone:refreshClientZones", playerServerId, Zones, isPlayerAuthorized(playerServerId))
            end
        end)
    end)
end
fetchZone()

RegisterNetEvent("izone:deleteZone")
AddEventHandler("izone:deleteZone", function(id)
    if (isPlayerAuthorized(source)) then
        local source = tonumber(source)
        MySQL.Async.execute("DELETE FROM zones WHERE id=@id", {
            ['@id']=id
        }, function(res)
            TriggerClientEvent("izone:notification", source, "Successfully deleted the zone")
            fetchZone()
        end)
    else
        if Config.ENABLE_UNAUTHORIZE_WARNING_LOGS then
            printUnauthorizedLogForPlayer()
        end
    end
end)

RegisterNetEvent("izone:requestZones")
AddEventHandler("izone:requestZones", function()
    -- still not initialized
    if Zones == nil then 
        fetchZone()
    else
        print("from request Zone " .. tostring(isPlayerAuthorized(source)))
        TriggerClientEvent("izone:refreshClientZones", source, Zones, isPlayerAuthorized(source))
    end
end)

RegisterNetEvent("izone:saveZone")
AddEventHandler("izone:saveZone", function(points, name, cat)
    local source = source
    local points = ceilPoints(points)
    local encodedPoints = json.encode(points)
    local center = getCenter(points)
    local encodedCenter = json.encode(center)
    local maxLength = getMaxLength(points, center)
    MySQL.Async.execute("INSERT INTO zones (points, center, max_length, name, cat) VALUES (@points, @center, @max_length, @name, @cat)", {
        ['@points']=encodedPoints,
        ['@center']=encodedCenter,
        ['@max_length']=maxLength,
        ['@name']=name,
        ['@cat']=cat
    }, function(res)
        TriggerClientEvent("izone:notification", source, "Successfully saved the zone: " .. name, 1)
        fetchZone()
    end)
end)

function getCenter(points)
	local allX = 0
    local allY = 0
    local allZ = 0
	for i=1, #points do
		allX = allX + tonumber(points[i].x)
        allY = allY + tonumber(points[i].y)
        allZ = allZ + tonumber(points[i].z)
	end
	local resultX = allX / #points
    local resultY = allY / #points
    local resultZ = allZ / #points
	return {x=resultX, y=resultY, z=resultZ}
end

function getMaxLength(points, center)
	local listDist = { }
	for i=1, #points do
		table.insert(listDist, getDistance(tonumber(center.x), tonumber(center.y), tonumber(points[i].x), tonumber(points[i].y)))
	end
	return getMax(listDist)
end

function getMax(table)
	local max = 0
	for i=1, #table do
		if table[i] > max then max = table[i] end
	end
	return max
end

function getDistance(x1,y1,x2,y2)
	return math.sqrt((x2 - x1) ^ 2 + (y2 - y1) ^ 2)
end

function ceilPoints(points)
    local _points = {}
    for i,v in ipairs(points) do
        table.insert(_points, {
            x = math.ceil(v.xs*100)/100,
            y = math.ceil(v.ys*100)/100,
            z = math.ceil(v.zs*100)/100
        })
    end
    return _points
end

function PrintPoints(points)
    for i,v in ipairs(points) do 
        for k,v in pairs(points[i]) do
            print(k,v)
        end
    end
end