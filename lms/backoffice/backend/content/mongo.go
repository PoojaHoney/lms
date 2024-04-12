package main

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (svc *Service) getAllFromMongo(collectionName string, filter bson.M, opts *options.FindOptions) ([]interface{}, error) {
    collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(collectionName)
    cursor, err := collection.Find(context.TODO(), filter, opts)
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.TODO())
    var results []interface{}
    for cursor.Next(context.TODO()) {
        var document map[string]interface{}
        if err := cursor.Decode(&document); err != nil {
            continue
        }
        results = append(results, document)
    }
    if err := cursor.Err(); err != nil {
        return nil, err
    }
    return results, nil
}


func (svc *Service) getOneFromMongo(collectionName string, filter bson.M) (interface{}, error) {
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(collectionName)
	var doc map[string]interface{}
	err := collection.FindOne(context.TODO(), filter).Decode(&doc)
	if err != nil {
		return nil, err
	}
	return doc, nil
}

func (svc *Service) updateOneInMongo(id string,data map[string]interface{}, collection *mongo.Collection) error {
	objectId,_:=primitive.ObjectIDFromHex(id)
    delete(data, "_id")
    data["updatedAt"] = time.Now()
    filter := bson.M{"_id": objectId}
    update := bson.M{"$set": data}
    _, err := collection.UpdateOne(context.TODO(), filter, update)
    if err != nil {
        return err
    }
    return nil
}


func (svc *Service) deleteOneFromMongo(id string, collection *mongo.Collection) error {
	objectId,_:=primitive.ObjectIDFromHex(id)
    filter := bson.M{"_id": objectId}
    update := bson.M{"$set": bson.M{"status": "deleted"}}
    _, err := collection.UpdateOne(context.TODO(), filter, update)
    if err != nil {
        return err
    }
    return nil
}

func (svc *Service) insertOneToMongo(data interface{}, collection *mongo.Collection, name string) (primitive.ObjectID,error) {
	// filter := bson.M{"enrollID": name,"active": true}
    filter := bson.M{
        "$and": []bson.M{
            bson.M{"enrollID": name},
            bson.M{"enrollID": bson.M{"$ne": "default"}},
        },
        "status": bson.M{"$ne":"deleted"},
    }    
	count,_:=collection.CountDocuments(context.TODO(), filter)
	if count > 0 {
		return primitive.NilObjectID,errors.New("Item already exists")
	}
	record, err := collection.InsertOne(context.TODO(), data)
	if err != nil {
		return primitive.NilObjectID,err
	}
    insertedID,ok := record.InsertedID.(primitive.ObjectID)
    if !ok {
        insertedID,_ = primitive.ObjectIDFromHex(record.InsertedID.(string))
    }
	return insertedID,nil
}

func (svc *Service) countDocuments(collectionName string, filter bson.M) (int64, error) {
    collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(collectionName)
    count, err := collection.CountDocuments(context.TODO(), filter)
    if err != nil {
        return 0, err
    }
    return count, nil
}