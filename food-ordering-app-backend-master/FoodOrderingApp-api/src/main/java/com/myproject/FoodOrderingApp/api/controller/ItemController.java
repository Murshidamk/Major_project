package com.myproject.FoodOrderingApp.api.controller;

import com.myproject.FoodOrderingApp.api.model.ItemList;
import com.myproject.FoodOrderingApp.api.model.ItemListResponse;
import com.myproject.FoodOrderingApp.service.business.ItemService;
import com.myproject.FoodOrderingApp.service.business.RestaurantService;
import com.myproject.FoodOrderingApp.service.entity.ItemEntity;
import com.myproject.FoodOrderingApp.service.entity.RestaurantEntity;
import com.myproject.FoodOrderingApp.service.exception.RestaurantNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private RestaurantService restaurantService;

    /**
     * Method takes restaurant_id from customer, returns top 5 popular items
     *
     * @param restaurantId restaurant id as request path var
     * @return ResponseEntity with list of items
     * @throws RestaurantNotFoundException on invalid restaurantId
     */
    @CrossOrigin
    @RequestMapping(method = RequestMethod.GET,
        path = "/item/restaurant/{restaurant_id}",
        produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ItemListResponse> getItemsByPopularity(@PathVariable("restaurant_id") final String restaurantId)
        throws RestaurantNotFoundException {

        // Retrieve RestaurantEntity matching restaurantId from database
        RestaurantEntity restaurantEntity = restaurantService.restaurantByUUID(restaurantId);

        // Retrieve ItemEntity List matching restaurantId and sorted by popularity
        List<ItemEntity> itemList = itemService.getItemsByPopularity(restaurantEntity);

        ItemListResponse itemListResponse = new ItemListResponse();

        // Map retrieved ItemEntity to Response Object List
        int count = 0;
        for (ItemEntity itemEntity : itemList) {
            if (count < 5) {
                ItemList items = new ItemList()
                    .id(UUID.fromString(itemEntity.getUuid()))
                    .itemName(itemEntity.getItemName())
                    .price(itemEntity.getPrice())
                    .itemType(ItemList.ItemTypeEnum.fromValue(itemEntity.getType().getValue()));
                itemListResponse.add(items);
                count = count + 1;
            } else {
                break;
            }
        }

        return new ResponseEntity<ItemListResponse>(itemListResponse, HttpStatus.OK);
    }
}
