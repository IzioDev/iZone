local allZone = {}
local init = false

AddEventHandler("onMySQLReady", function()
    fetchZone()
end)

function fetchZone()
    MySQL.Async.fetchAll('SELECT * FROM zones', {}, function(zones)
        for i,v in ipairs(zones) do
            zones[i].points = json.decode(zones[i].points)
            zones[i].center = json.decode(zones[i].center)
        end
        allZone = zones
        TriggerClientEvent("izone:transfertzones", -1, allZone)
    end)
end

if (Config.USE_ESSENTIALMODE_ADMIN_SYSTEM) then
    AddEventHandler('es:playerLoaded', function(source)
        local source = tonumber(source)
        TriggerClientEvent("izone:transfertzones", source, allZone)
    end)
end

if (not(Config.USE_ESSENTIALMODE_ADMIN_SYSTEM)) then
    RegisterNetEvent("izone:admin")
    AddEventHandler("izone:admin", function()
        local _source = source
        local steamID = GetPlayerIdentifiers(_source)[1] or false
        for i,v in ipairs(Config.ADMINS) do
            if steamID == v then
                TriggerClientEvent("izone:okadmin", _source)
                return
            end
        end
    end)
end

RegisterNetEvent("izone:deleteZone")
AddEventHandler("izone:deleteZone", function(id)
    print(id)
    local source = tonumber(source)
    MySQL.Async.execute("DELETE FROM zones WHERE id=@id", {
        ['@id']=id
    }, function(res)
        TriggerClientEvent("izone:notification", source, "Successfully deleted the zone")
        fetchZone()
    end)
end)

RegisterNetEvent("izone:gimme")
AddEventHandler("izone:gimme", function()
    local source = tonumber(source)
	TriggerClientEvent("izone:transfertzones", source, allZone)
end)

RegisterNetEvent("izone:saveZone")
AddEventHandler("izone:saveZone", function(points, name, cat)
    local source = source
    local points = ceilPoints(points)
    local serialized_points = json.encode(points)
    local center = getCenter(points)
    local serialized_center = json.encode(center)
    local maxLength = getMaxLength(points, center)
    MySQL.Async.execute("INSERT INTO zones (points, center, maxLength, name, cat) VALUES (@points, @center, @maxLength, @name, @cat)", {
        ['@points']=serialized_points,
        ['@center']=serialized_center,
        ['@maxLength']=maxLength,
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