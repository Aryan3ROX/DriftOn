import java.sql.*;
import java.util.*;
import java.text.*;

public class JavaBridge {
    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("{\"error\":\"No command provided\"}");
            return;
        }

        try {
            // Explicitly load the JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            String command = args[0];
            
            switch (command) {
                case "getVehicle":
                    if (args.length >= 2) {
                        int vehicleID = Integer.parseInt(args[1]);
                        getVehicle(vehicleID);
                    } else {
                        System.out.println("{\"error\":\"Vehicle ID not provided\"}");
                    }
                    break;
                    
                case "bookRide":
                    if (args.length >= 8) {  // Changed from 7 to 8 because date is split into 2 args
                        int userID = Integer.parseInt(args[1]);
                        int vehicleID = Integer.parseInt(args[2]);
                        
                        // Combine date parts if they're split
                        String date;
                        if (args[4].matches("\\d\\d:\\d\\d:\\d\\d")) {
                            // Date is split into args[3] and args[4]
                            date = args[3] + " " + args[4];
                            // Shift remaining args
                            int distance = Integer.parseInt(args[5]);
                            double price = Double.parseDouble(args[6]);
                            int days = Integer.parseInt(args[7]);
                            int driverID = Integer.parseInt(args[8]);
                            bookRide(userID, vehicleID, date, distance, price, days, driverID);
                        } else {
                            // Date is a single argument (if you've encoded it)
                            date = args[3];
                            int distance = Integer.parseInt(args[4]);
                            double price = Double.parseDouble(args[5]);
                            int days = Integer.parseInt(args[6]);
                            int driverID = Integer.parseInt(args[7]);
                            bookRide(userID, vehicleID, date, distance, price, days, driverID);
                        }
                    } else {
                        System.out.println("{\"error\":\"Missing arguments for booking\"}");
                    }
                    break;
                    
                case "submitFeedback":
                    if (args.length >= 5) {
                        int rideID = Integer.parseInt(args[1]);
                        int rating = Integer.parseInt(args[2]);
                        String review = args[3];
                        int recommendation = Integer.parseInt(args[4]);
                        submitFeedback(rideID, rating, review, recommendation);
                    } else {
                        System.out.println("{\"error\":\"Missing arguments for feedback\"}");
                    }
                    break;
                    
                case "viewHistory":
                    if (args.length >= 2) {
                        int userID = Integer.parseInt(args[1]);
                        viewHistory(userID);
                    } else {
                        System.out.println("{\"error\":\"User ID not provided\"}");
                    }
                    break;
                    
                case "viewDetailedReview":
                    if (args.length >= 2) {
                        int rideID = Integer.parseInt(args[1]);
                        viewDetailedReview(rideID);
                    } else {
                        System.out.println("{\"error\":\"Ride ID not provided\"}");
                    }
                    break;

                case "getVehicles":
                    // Parse filter parameters (if any were provided)
                    String name = args.length > 1 ? args[1] : null;
                    String fuel_type = args.length > 2 ? args[2] : null;
                    String transmission = args.length > 3 ? args[3] : null;
                    String seats = args.length > 4 ? args[4] : null;
                    String price_per_day = args.length > 5 ? args[5] : null;
                    String type = args.length > 6 ? args[6] : null;
                    getVehicles(name, fuel_type, transmission, seats, price_per_day, type);
                    break;
                    
                case "getDrivers":
                    String rating = args.length > 1 ? args[1] : null;
                    String driver_price = args.length > 2 ? args[2] : null;
                    String preference = args.length > 3 ? args[3] : null;
                    getDrivers(rating, driver_price, preference);
                    break;
                    
                case "getPromos":
                    getPromos();
                    break;
                    
                case "getLeaderboard":
                    getLeaderboard();
                    break;
                    
                default:
                    System.out.println("{\"error\":\"Unknown command\"}");
                    break;
            }
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }
    
    private static void getVehicle(int vehicleID) {
        Connection connect = null;
        Statement statement = null;
        ResultSet resultSet = null;
        
        try {
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            statement = connect.createStatement();
            statement.executeUpdate("use dbms_project");
            
            // Execute query
            resultSet = statement.executeQuery("SELECT * FROM vehicles WHERE vehicleID = " + vehicleID);
            
            // Build JSON response manually
            StringBuilder json = new StringBuilder("{");
            boolean hasData = false;
            
            if (resultSet.next()) {
                hasData = true;
                json.append("\"status\":\"success\",\"vehicle\":{");
                
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            } else {
                json.append("\"status\":\"not_found\",\"message\":\"Vehicle not found\"");
            }
            
            json.append("}");
            System.out.println(json.toString());
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            closeResources(resultSet, statement, connect);
        }
    }
    
    private static void bookRide(int userID, int vehicleID, String encodedDate, int distance, double price, int days, int driverID) {
        Connection connect = null;
        Statement statement = null;
        PreparedStatement prepStmt = null;
        ResultSet resultSet = null;
        
        try {
            // Convert encoded date back to SQL format
            String date = encodedDate.replace("_", " ").replace("-", ":");
            
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            statement = connect.createStatement();
            statement.executeUpdate("use dbms_project");
            
            // Get the last rideID
            resultSet = statement.executeQuery("SELECT rideID FROM bookings ORDER BY rideID DESC LIMIT 1");
            
            int rideID = 1; // Default value if no rides exist
            if (resultSet.next()) {
                rideID = resultSet.getInt("rideID") + 1;
            }
            
            // Insert the new booking
            String insertSQL = "INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            prepStmt = connect.prepareStatement(insertSQL);
            prepStmt.setInt(1, rideID);
            prepStmt.setInt(2, userID);
            prepStmt.setInt(3, vehicleID);
            prepStmt.setString(4, date);
            prepStmt.setInt(5, distance);
            prepStmt.setDouble(6, price);
            prepStmt.setInt(7, days);
            prepStmt.setInt(8, driverID);
            
            int rowsAffected = prepStmt.executeUpdate();
            
            StringBuilder json = new StringBuilder("{");
            if (rowsAffected > 0) {
                json.append("\"status\":\"success\",");
                json.append("\"message\":\"Ride Booked Successfully!\",");
                json.append("\"rideID\":").append(rideID);
            } else {
                json.append("\"status\":\"error\",");
                json.append("\"message\":\"Failed to book ride\"");
            }
            json.append("}");
            
            System.out.println(json.toString());
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            if (prepStmt != null) {
                try { prepStmt.close(); } catch (SQLException e) { /* ignore */ }
            }
            closeResources(resultSet, statement, connect);
        }
    }
    
    private static void submitFeedback(int rideID, int rating, String review, int recommendation) {
        Connection connect = null;
        Statement statement = null;
        PreparedStatement prepStmt = null;
        ResultSet resultSet = null;
        
        try {
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            connect.setAutoCommit(false); // Start transaction
            statement = connect.createStatement();
            statement.executeUpdate("use dbms_project");
            
            // Get booking details
            String bookingSQL = "SELECT * FROM bookings WHERE rideID = ?";
            prepStmt = connect.prepareStatement(bookingSQL);
            prepStmt.setInt(1, rideID);
            resultSet = prepStmt.executeQuery();
            
            if (!resultSet.next()) {
                System.out.println("{\"error\":\"Ride not found\"}");
                return;
            }
            
            int vehicleID = resultSet.getInt("vehicleID");
            int driverID = resultSet.getInt("driverID");
            
            // Update driver rating if driver exists
            if (driverID > 0) {
                prepStmt.close();
                String driverSQL = "UPDATE drivers SET total_trips = total_trips + 1, rating = ((rating * (total_trips - 1)) + ?) / total_trips WHERE driverID = ?";
                prepStmt = connect.prepareStatement(driverSQL);
                prepStmt.setInt(1, rating);
                prepStmt.setInt(2, driverID);
                prepStmt.executeUpdate();
            }
            
            // Insert into leaderboard
            prepStmt.close();
            String leaderboardSQL = "INSERT INTO leaderboard VALUES (?, ?, ?, ?, ?)";
            prepStmt = connect.prepareStatement(leaderboardSQL);
            prepStmt.setInt(1, rideID);
            prepStmt.setInt(2, vehicleID);
            prepStmt.setInt(3, rating);
            prepStmt.setString(4, review);
            prepStmt.setInt(5, recommendation);
            prepStmt.executeUpdate();
            
            connect.commit(); // Commit transaction
            
            System.out.println("{\"status\":\"success\",\"message\":\"Leaderboard Updated Successfully!\"}");
        } catch (Exception e) {
            try {
                if (connect != null) connect.rollback(); // Rollback on error
            } catch (SQLException ex) {
                // Ignore rollback error
            }
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            if (prepStmt != null) {
                try { prepStmt.close(); } catch (SQLException e) { /* ignore */ }
            }
            closeResources(resultSet, statement, connect);
        }
    }
    
    private static void viewHistory(int userID) {
        Connection connect = null;
        PreparedStatement prepStmt = null;
        ResultSet resultSet = null;
        
        try {
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            connect.createStatement().executeUpdate("use dbms_project");
            
            String sql = "SELECT * FROM bookings WHERE userID = ? ORDER BY date DESC";
            prepStmt = connect.prepareStatement(sql);
            prepStmt.setInt(1, userID);
            resultSet = prepStmt.executeQuery();
            
            StringBuilder json = new StringBuilder("{");
            json.append("\"status\":\"success\",");
            json.append("\"results\":[");
            
            boolean firstRow = true;
            while (resultSet.next()) {
                if (!firstRow) json.append(",");
                firstRow = false;
                
                json.append("{");
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else if (value instanceof java.sql.Timestamp) {
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                        json.append("\"").append(sdf.format((java.sql.Timestamp)value)).append("\"");
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            }
            
            json.append("]}");
            System.out.println(json.toString());
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            if (prepStmt != null) {
                try { prepStmt.close(); } catch (SQLException e) { /* ignore */ }
            }
            closeResources(resultSet, null, connect);
        }
    }
    
    private static void viewDetailedReview(int rideID) {
        Connection connect = null;
        PreparedStatement prepStmt = null;
        ResultSet resultSet = null;
        
        try {
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            connect.createStatement().executeUpdate("use dbms_project");
            
            String sql = "SELECT * FROM leaderboard WHERE rideID = ?";
            prepStmt = connect.prepareStatement(sql);
            prepStmt.setInt(1, rideID);
            resultSet = prepStmt.executeQuery();
            
            StringBuilder json = new StringBuilder("{");
            json.append("\"status\":\"success\",");
            json.append("\"review\":[");
            
            boolean firstRow = true;
            while (resultSet.next()) {
                if (!firstRow) json.append(",");
                firstRow = false;
                
                json.append("{");
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else if (value instanceof Boolean) {
                        json.append(value);
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            }
            
            json.append("]}");
            System.out.println(json.toString());
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            if (prepStmt != null) {
                try { prepStmt.close(); } catch (SQLException e) { /* ignore */ }
            }
            closeResources(resultSet, null, connect);
        }
    }

    private static void getVehicles(String name, String fuel_type, String transmission, String seats, String price_per_day, String type) {
        Connection connect = null;
        PreparedStatement prepStmt = null;
        ResultSet resultSet = null;
        
        try {
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            connect.createStatement().executeUpdate("use dbms_project");
            
            StringBuilder queryStr = new StringBuilder("SELECT * FROM vehicles WHERE 1=1");
            List<Object> params = new ArrayList<>();
            
            if (name != null && !name.equals("null")) {
                String new_name = name.trim().toLowerCase();
                queryStr.append(" AND name LIKE ?");
                params.add("%" + new_name + "%");
            }
            
            if (fuel_type != null && !fuel_type.equals("null")) {
                queryStr.append(" AND fuel_type = ?");
                params.add(fuel_type);
            }
            
            if (transmission != null && !transmission.equals("null")) {
                queryStr.append(" AND transmission = ?");
                params.add(transmission);
            }
            
            if (seats != null && !seats.equals("null")) {
                if (seats.equals("7+")) {
                    queryStr.append(" AND seats >= 7");
                } else {
                    queryStr.append(" AND seats = ?");
                    params.add(Integer.parseInt(seats));
                }
            }
            
            if (price_per_day != null && !price_per_day.equals("null")) {
                queryStr.append(" AND price_per_day <= ?");
                params.add(Double.parseDouble(price_per_day));
            }
            
            if (type != null && !type.equals("null")) {
                queryStr.append(" AND type = ?");
                params.add(type);
            }
            
            prepStmt = connect.prepareStatement(queryStr.toString());
            
            // Set parameters
            for (int i = 0; i < params.size(); i++) {
                prepStmt.setObject(i + 1, params.get(i));
            }
            
            resultSet = prepStmt.executeQuery();
            
            StringBuilder json = new StringBuilder("{");
            json.append("\"status\":\"success\",");
            json.append("\"vehicles\":[");
            
            boolean firstRow = true;
            while (resultSet.next()) {
                if (!firstRow) json.append(",");
                firstRow = false;
                
                json.append("{");
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else if (value instanceof Boolean) {
                        json.append(value);
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            }
            
            json.append("]}");
            System.out.println(json.toString());
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            if (prepStmt != null) {
                try { prepStmt.close(); } catch (SQLException e) { /* ignore */ }
            }
            closeResources(resultSet, null, connect);
        }
    }

    private static void getDrivers(String ratingStr, String price_per_dayStr, String preference) {
        Connection connect = null;
        PreparedStatement prepStmt = null;
        ResultSet resultSet = null;
        
        try {
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            connect.createStatement().executeUpdate("use dbms_project");
            
            StringBuilder queryStr = new StringBuilder("SELECT * FROM drivers WHERE 1=1");
            List<Object> params = new ArrayList<>();
            
            if (ratingStr != null && !ratingStr.equals("null") && !ratingStr.isEmpty()) {
                queryStr.append(" AND rating >= ?");
                params.add(Double.parseDouble(ratingStr));
            }
            
            if (price_per_dayStr != null && !price_per_dayStr.equals("null") && !price_per_dayStr.isEmpty()) {
                queryStr.append(" AND price_per_day <= ?");
                params.add(Double.parseDouble(price_per_dayStr));
            }
            
            if (preference != null && !preference.equals("null") && !preference.equals("None") && !preference.isEmpty()) {
                queryStr.append(" AND preference = ?");
                params.add(preference);
            }
            
            prepStmt = connect.prepareStatement(queryStr.toString());
            
            // Set parameters
            for (int i = 0; i < params.size(); i++) {
                prepStmt.setObject(i + 1, params.get(i));
            }
            
            resultSet = prepStmt.executeQuery();
            
            StringBuilder json = new StringBuilder("{");
            json.append("\"status\":\"success\",");
            json.append("\"drivers\":[");
            
            boolean firstRow = true;
            while (resultSet.next()) {
                if (!firstRow) json.append(",");
                firstRow = false;
                
                json.append("{");
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else if (value instanceof Boolean) {
                        json.append(value);
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            }
            
            json.append("]}");
            System.out.println(json.toString());
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            if (prepStmt != null) {
                try { prepStmt.close(); } catch (SQLException e) { /* ignore */ }
            }
            closeResources(resultSet, null, connect);
        }
    }

    private static void getPromos() {
        Connection connect = null;
        Statement statement = null;
        ResultSet resultSet = null;
        
        try {
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            statement = connect.createStatement();
            statement.executeUpdate("use dbms_project");
            
            resultSet = statement.executeQuery("SELECT * FROM promotions WHERE active = TRUE");
            
            StringBuilder json = new StringBuilder("{");
            json.append("\"status\":\"success\",");
            json.append("\"promos\":[");
            
            boolean firstRow = true;
            while (resultSet.next()) {
                if (!firstRow) json.append(",");
                firstRow = false;
                
                json.append("{");
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else if (value instanceof Boolean) {
                        json.append(value);
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            }
            
            json.append("]}");
            System.out.println(json.toString());
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            closeResources(resultSet, statement, connect);
        }
    }

    private static void getLeaderboard() {
        Connection connect = null;
        Statement statement = null;
        ResultSet resultSet = null;
        
        try {
            String url = System.getenv("JDBC_URL");
            String user = System.getenv("JDBC_USER");
            String password = System.getenv("JDBC_PASSWORD");
            
            if (url == null || user == null || password == null) {
                System.out.println("{\"error\":\"Missing database credentials in environment\"}");
                return;
            }
            
            connect = DriverManager.getConnection(url, user, password);
            statement = connect.createStatement();
            statement.executeUpdate("use dbms_project");
            
            // Get top rides
            StringBuilder json = new StringBuilder("{");
            json.append("\"status\":\"success\",");
            
            // Get rides leaderboard
            resultSet = statement.executeQuery("SELECT * FROM leaderboard ORDER BY rating DESC LIMIT 10");
            json.append("\"rides\":[");
            
            boolean firstRow = true;
            while (resultSet.next()) {
                if (!firstRow) json.append(",");
                firstRow = false;
                
                json.append("{");
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else if (value instanceof Boolean) {
                        json.append(value);
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            }
            json.append("],");
            
            // Get drivers leaderboard
            resultSet.close();
            resultSet = statement.executeQuery("SELECT * FROM drivers ORDER BY rating DESC LIMIT 10");
            json.append("\"drivers\":[");
            
            firstRow = true;
            while (resultSet.next()) {
                if (!firstRow) json.append(",");
                firstRow = false;
                
                json.append("{");
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else if (value instanceof Boolean) {
                        json.append(value);
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            }
            json.append("],");
            
            // Get vehicles leaderboard
            resultSet.close();
            resultSet = statement.executeQuery("SELECT image_url, name FROM vehicles NATURAL JOIN leaderboard ORDER BY rating DESC LIMIT 10");
            json.append("\"vehicles\":[");
            
            firstRow = true;
            while (resultSet.next()) {
                if (!firstRow) json.append(",");
                firstRow = false;
                
                json.append("{");
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    
                    if (i > 1) json.append(",");
                    
                    json.append("\"").append(columnName).append("\":");
                    
                    if (value == null) {
                        json.append("null");
                    } else if (value instanceof Number) {
                        json.append(value);
                    } else {
                        json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
                    }
                }
                json.append("}");
            }
            json.append("]");
            
            json.append("}");
            System.out.println(json.toString());
        } catch (Exception e) {
            System.out.println("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        } finally {
            closeResources(resultSet, statement, connect);
        }
    }
    
    private static void closeResources(ResultSet rs, Statement stmt, Connection conn) {
        try {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        } catch (SQLException e) {
        }
    }
}