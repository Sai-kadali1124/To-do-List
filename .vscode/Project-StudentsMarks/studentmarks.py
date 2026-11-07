# student Marks and performance Analyzer 
marks=[85,67,92,45,78,0,88,67]
def display_menu():
    print("\n==== STUDENT MARKS ANALYZER ====")
    print("1.Display all marks")
    print("2.Add new mark")
    print("3.Find the Highest mark")
    print("4.Find the lowest mark")
    print("5.calculate the average")
    print("6.count the passed students")
    print("7.sorted marks")
    print("8. Remove mark by value")
    print("9. Remove mark by index")
    print("10. Count even and odd marks")
    print("11. Calculate even and odd sums")
    print("12. Find second largest unique mark")
    print("13. Move zeros to the end")
    print("14.Exit")
def display_marks():
    print("\nStudent Marks: ")
    for mark in marks:
        print(mark)
def add_mark():
    new_mark=int(input("Enter new mark: "))
    marks.append(new_mark)
    print("Marks added successfully...") 
def find_highest():
    highest=marks[0]
    for mark in marks:
        if mark>highest:
            highest=mark
    return highest
def find_lowest():
    lowest=marks[0]
    for mark in marks:
        if mark<lowest:
            lowest=mark
    return lowest

def calculate_average():
    total=sum(marks)
    count=len(marks)
    average=total/count
    return average

def count_passed():
    passed=0
    for mark in marks:
        if mark>=40:
            passed+=1
    return passed

def sort_marks():
    marks.sort()
    return marks

# remove a mark
def remove_mark():
    mark_to_remove=int(input("Enter marks to remove: "))
    if mark_to_remove in marks:
        marks.remove(mark_to_remove)
        print("Mark removed successfully...")
    else:
        print("Marks are not found..")
    return marks

# now iam using pop to delete by index
def remove_mark_by_index():
    index=int(input("Enter index to remove: "))
    if 0<= index < len(marks):
        remove_mark=marks.pop(index)
        print("Removed mark: ",remove_mark)
    else:
        print("Invalid index!")
    return marks

#counting even and odd marks 
def count_even_odd():
    even_count=0
    odd_count=0
    for mark in marks:
       if mark%2==0:
           even_count+=1
       else:
           odd_count+=1
    return even_count,odd_count

# calculate even sum and odd sum
def calculate_even_odd_sum():
    even_sum=0
    odd_sum=0
    for mark in marks:
        if mark%2==0:
            even_sum+=mark
        else:
            odd_sum+=mark
    return even_sum,odd_sum

#Find the second largest unique mark :
def find_second_largest():
    unique_marks=list(set(marks))
    if len(unique_marks)<2:
        return "Second largest is doesnot exit "
    unique_marks.sort()
    return unique_marks[-2] #after sorting finding the sec largest from the last

#Move zero marks to the end 
def move_zeros():
    non_zero_marks=[]
    for mark in marks:
        if mark!=0:
            non_zero_marks.append(mark) #putting non zeros in this 
    zero_count=marks.count(0)
    for i in range(zero_count):
        non_zero_marks.append(0) # zero are putting at last 
    return non_zero_marks

# menu drive application 
def main():
    while True:
        display_menu()
        choice=int(input("Enter your choice: "))
        if choice == 1:
            display_marks()
        elif choice ==2:
             add_mark()
        elif choice == 3:
            print("Highest mark  : ",find_highest())
        elif choice == 4:
            print("Lowest mark: ",find_lowest())
        elif choice == 5:
            print("Average marks:", calculate_average())

        elif choice == 6:
            print("Passed students:", count_passed())

        elif choice == 7:
            print("Sorted marks:", sort_marks())

        elif choice == 8:
            remove_mark()
        elif choice == 9:
            remove_mark_by_index()

        elif choice == 10:
            even, odd = count_even_odd()
            print("Even count:", even)
            print("Odd count:", odd)

        elif choice == 11:
            even_total, odd_total = calculate_even_odd_sum()
            print("Even sum:", even_total)
            print("Odd sum:", odd_total)

        elif choice == 12:
            print("Second largest:", find_second_largest())

        elif choice == 13:
            print("Marks after moving zeros:", move_zeros())

        elif choice == 14:
            print("Thank you for using Student Marks Analyzer!")
            break
        else:
            print("Invalid choice! Try again.")
if __name__ == "__main__":
    main()
